## Context

The backend already has full member management REST endpoints (add, remove, promote, demote) and single-recipe sharing. The frontend group settings page has kick buttons but lacks: add-member UI, promote/demote buttons, and a bulk recipe sharing flow. There is no way to invite users by email — admins must know raw user IDs. No database seed script exists for development.

The codebase is plain Express.js (not NestJS) with Prisma ORM, React 19 + Next.js App Router, TanStack React Query 5, and MUI 7. Shared Zod schemas live in `@family-recipe/shared`. The existing pattern: route handlers call Prisma directly (no service layer), frontend hooks wrap API calls via custom Axios client.

## Goals / Non-Goals

**Goals:**
- Let group admins search users by email and invite them to the group
- Provide in-app invitation acceptance (no external email sending)
- Add promote-to-admin and demote-from-admin UI in the member list
- Allow bulk sharing of multiple recipes to a group from a single dialog
- Provide a batch endpoint for adding multiple recipes at once
- Create a Prisma seed script for dev/test data

**Non-Goals:**
- External email sending (SMTP, SendGrid, etc.) — invites are in-app only
- Friend list / social connections feature
- Real-time notifications (polling or WebSocket)
- Pagination (already missing project-wide; deferred)
- Automated tests (split into separate `testing-infrastructure` change)

## Decisions

### Decision 1: Invitation as DB table + in-app acceptance

**Chosen**: New `Invitation` table with UUID token, status enum, expiresAt. Invitee sees pending invites on group list page via a banner/ribbon. Acceptance happens via `POST /v1/groups/:id/invitations/:invitationId/accept`.

**Rationale**: No external email infrastructure needed. Token-based URL pattern is standard. Expiration prevents stale invites. In-app surface (banner) is discoverable — user sees invites when visiting groups.

**Alternatives considered**:
- *External email*: Requires SMTP setup, email templates, rate limiting. Overkill for current scope.
- *Friend list*: Larger feature requiring new table, request/accept flow, blocking/unblocking. Deferred.

### Decision 2: User lookup by email param

**Chosen**: `GET /v1/users/search?email=partial@domain.com` endpoint using Prisma `contains` on email field. Returns matching users (id, name, email, avatar). Used by add-member dialog for autocomplete-style search.

**Rationale**: Simple, matches existing `?search=` pattern on groups/recipes. No new table needed.

**Alternatives considered**:
- *Full-text search*: Heavier, needs PostgreSQL tsvector. Overkill for exact/prefix email matching.
- *Get all users*: No pagination exists project-wide; listing all users is unsafe.

### Decision 3: Bulk recipe endpoint as new route

**Chosen**: `POST /v1/groups/:id/recipes/batch` accepting `{ recipeIds: string[] }`. Upserts all in a Prisma transaction. Returns `{ added: string[], skipped: string[] }`.

**Rationale**: Avoids N+1 API calls from the frontend. Transaction ensures atomicity — either all recipes are added or none. Existing single-recipe endpoint unchanged.

### Decision 4: Bulk share dialog as reusable component

**Chosen**: `BulkShareDialog` component that fetches all user recipes, filters those already shared to the group (using `GET /v1/recipes` + `GET /v1/groups/:id` `recipeIds`), displays as selectable cards, and calls batch endpoint. Triggered by FAB on group detail page.

**Rationale**: Reuses existing recipe data hooks. Follows existing component patterns (MUI Dialog, React Query). Group detail page already has `recipeIds` in its response for filtering.

### Decision 5: Seed script as Prisma seed

**Chosen**: `apps/api/prisma/seed.ts` invoked via `prisma db seed` (or `yarn seed` script). Creates 5 users, 15 recipes, 3 groups with varied memberships. Idempotent — checks for existing data, upserts where needed.

**Rationale**: Prisma's built-in `seed` command is standard. Idempotency prevents duplicate data on repeated runs. Uses bcrypt for realistic password hashes.

### Decision 6: Promote/demote as icon buttons in member list

**Chosen**: Each member row in the settings page gets conditional icon buttons: crown (promote) if member is not admin, remove-crown (demote) if member IS admin. Both only visible to admins. Use existing `useAddAdmin` / `useRemoveAdmin` hooks (or create them if missing).

**Rationale**: Follows existing kick button pattern. Icons are intuitive (crown for admin). Backend endpoints already exist.

## Risks / Trade-offs

- **[Invitation spam]**: Any admin can invite any email repeatedly. → Rate-limit invitation creation to 5/hour per group (future improvement; not in scope).
- **[Expired invites]**: Invites expire but remain in DB. → Periodic cleanup via expiration check on list/get; deletion deferred to future maintenance task.
- **[Bulk share performance]**: Sharing 100+ recipes in one request could be slow. → Transaction handles atomicity; for MVP limits, 50 recipes max per batch (frontend validation).
- **[Seed charset]**: Seed data uses English-only names/descriptions. → Acceptable for dev; i18n test data is separate concern.

## Open Questions

- None. All decisions made above.
