## Context

Currently groups have a single `ownerId` field — exactly one owner per group. All admin operations (update group, add/remove recipes, add/remove members) check `group.ownerId === req.userId`. Account deletion blocks users who own any group.

This change migrates from single-owner to multi-admin via a `GroupAdmin` junction table. Each group can have 1+ admins. The existing `GroupMember` table remains for membership — admins are also members. The `ownerId` field and `ownedGroups` relation on `User` are removed.

Blocked by `user-profile-settings` (account deletion guard currently checks `ownerId`; after this change, it checks `GroupAdmin` count).

## Goals / Non-Goals

**Goals:**
- Replace single `Group.ownerId` with `GroupAdmin` junction table
- Any admin can perform owner-equivalent operations (update group, manage members, manage recipes, delete group)
- Account deletion guard checks for sole-admin groups instead of owned groups
- Quit route: admin can leave if at least one other admin remains
- Migration preserves existing data (existing owners become GroupAdmin entries)
- All group API routes use `isAdmin` checks instead of `isOwner`

**Non-Goals:**
- Admin transfer UI (add admin, remove admin) — admin management endpoints exist but frontend wiring is out of scope per current proposal
- Role-based permissions beyond admin/member binary
- Cascading admin promotions (adding someone as admin auto-adds them as member)

## Decisions

### Decision 1: GroupAdmin junction table vs. role field on GroupMember

**Chosen: Separate `GroupAdmin` junction table**

Rationale:
- Both are legitimate. A `role` enum on `GroupMember` (`admin` | `member`) would work and be simpler (one table).
- However, `GroupAdmin` table provides:
  - **Direct querying**: `await prisma.groupAdmin.count({ where: { userId } })` vs. `await prisma.groupMember.count({ where: { userId, role: 'admin' } })` — simpler predicate, no enum drift
  - **No migration of existing `GroupMember` rows**: Existing members get no role change; only owners get a new `GroupAdmin` row. With role field, every existing `GroupMember` row needs backfill (`role: 'member'` default).
  - **Clean separation**: Membership and admin status are independent dimensions. A user can be member without admin, admin without being member (though invariants prevent the latter).
  - **Idempotent add**: `upsert` on composite key is natural for adding/removing admin status.
- Trade-off: One extra table and join. For the scale of family-recipes (small groups, tens of members), this is negligible.

Alternatives considered:
- `role` enum on `GroupMember`: Simpler, one fewer table. Rejected because existing `GroupMember` rows (~10-50) need migration, and query ergonomics are slightly worse.
- `adminIds: String[]` native PostgreSQL array: Fast but breaks Prisma type safety, no referential integrity, harder to query "all groups where user is admin".

### Decision 2: Create group also creates GroupAdmin entry

When a new group is created:
```prisma
prisma.group.create({
  data: {
    ...fields,
    members: { create: { userId } },
    admins: { create: { userId } },
  },
})
```

The creator is always an admin. No group can exist with zero admins. This invariant is enforced at the application layer (not database — PostgreSQL doesn't support CHECK constraints with subqueries easily).

### Decision 3: Remove member also removes admin status

If an admin removes a member, any existing `GroupAdmin` row for that user is also deleted. This prevents orphaned admin rows. Implemented via `deleteMany` on both tables.

### Decision 4: Quit route — admin can leave if other admins exist

Current logic (line 345):
```
if (group.ownerId === req.userId && memberCount > 1) → blocked
```

New logic:
```
if (isAdmin && !hasOtherAdmins && memberCount > 1) → blocked
if (isAdmin && hasOtherAdmins && memberCount > 1) → allowed (remove admin + member)
```

If the leaving user is the sole admin and there are other members, the quit is blocked. They must promote another admin or remove members first.

### Decision 5: Delete group — any admin can delete

Current check: `group.ownerId !== req.userId` → 403.

New check: `!group.admins.some(a => a.userId === req.userId)` → 403.

The "group has other members" guard (line 183) remains — any admin can delete, but only if they're the sole member. This preserves the existing UX constraint that groups with other members can't be casually deleted.

### Decision 6: Account deletion guard

Current: `prisma.group.findMany({ where: { ownerId: req.userId } })`.

New:
```typescript
const adminGroups = await prisma.groupAdmin.findMany({
  where: { userId: req.userId },
  include: {
    group: {
      include: { admins: { select: { userId: true } } },
    },
  },
});
const soleAdminGroups = adminGroups.filter(
  g => g.group.admins.length === 1
);
if (soleAdminGroups.length > 0) → 409 error
```

User can delete account if they're an admin but not the sole admin in any group.

### Decision 7: Migration strategy

Single Prisma migration with these steps:
1. Create `GroupAdmin` table (`groupId`, `userId`, composite PK, FK to Group + User with cascade delete)
2. Insert `GroupAdmin` row for every existing group (groupId = group.id, userId = group.ownerId)
3. Drop `ownerId` column from `Group`
4. Drop `ownedGroups` relation from `User`

This is a **breaking migration** — the API is incompatible during the window between steps 2 and 4 if code is updated before migration runs. Mitigation: deploy the migration first, then deploy code. The `ownerId` column exists but is unused by new code. A second migration drops the column after code is stable.

## Risks / Trade-offs

- **[Risk] Zero-admin group**: Application bug could leave a group with no admins, making it unmanageable. → Mitigation: Add invariant check in create/remove-admin routes; log and alert on zero-admin state. Future: consider a "reaper" script.
- **[Risk] Migration window**: Between migration and code deploy, old code still uses `ownerId`. → Mitigation: Keep `ownerId` column in migration step 1-2, only drop in step 3 after code deploy verified. Or: make new code backward-compatible (read `ownerId` as fallback) for one deploy cycle.
- **[Risk] Orphaned GroupAdmin rows**: Member-remove route must also delete GroupAdmin row. → Mitigation: Enforce in route handler; add integration test.
- **[Trade-off] Extra join in every group query**: `admins: { select: { userId: true } }` added to most group queries. → Acceptable; group lists are small (pagination not needed), and the join is on indexed composite PK.
- **[Trade-off] Frontend rewiring deferred**: Admin management endpoints exist but no UI builds them yet. → This is documented as future work; the group-admin-array change is backend-first.

## Migration Plan

1. **Create migration**: `npx prisma migrate dev --name add_group_admin_table` — adds `GroupAdmin` table and backfills from `ownerId`, keeps `ownerId` column for compatibility
2. **Deploy migration**: Run migration in production
3. **Deploy API code**: New code uses `GroupAdmin` table, ignores `ownerId`
4. **Verify**: All group operations work, admin checks pass
5. **Cleanup migration**: Drop `ownerId` column and `ownedGroups` relation after 1 week stable
6. **Rollback**: If issues arise in step 3-4, revert API code. The `ownerId` column still exists and has correct values from the backfill. A second deploy reverts to old code.

## Open Questions

- None — design is complete given the proposal scope. Frontend admin management UI is explicitly deferred.
