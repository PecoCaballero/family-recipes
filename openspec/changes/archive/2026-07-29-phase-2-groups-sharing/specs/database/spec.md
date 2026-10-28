## REMOVED Requirements

### Requirement: Group table and junction tables exist for future phases

**Reason**: Phase 2 implements groups & sharing. Group, GroupMember, and RecipeGroup tables are now actively used by API routes for group CRUD, membership management, and recipe sharing.

**Migration**: No schema migration needed — tables already exist from Phase 1 migration. Route handlers now query these tables (was previously documented as "not used in this phase").

## ADDED Requirements

### Requirement: GroupMember table enforces membership-based authorization

The GroupMember junction table (`groupId`, `userId` composite key) SHALL be used to determine group membership for both group visibility and recipe visibility gating. When listing groups for a user, only rows where the user has a GroupMember entry SHALL be returned. When listing recipes, recipes associated with groups the user belongs to SHALL be included.

#### Scenario: Groups filtered by membership

- **WHEN** the API queries groups for a user
- **THEN** the query filters by GroupMember.userId matching the authenticated user
- **THEN** groups where the user has no GroupMember row are excluded

#### Scenario: Recipe visibility uses group membership

- **WHEN** the API queries recipes visible to a user
- **THEN** the query includes recipes whose RecipeGroup.groupId is in the user's GroupMember.groupId set
