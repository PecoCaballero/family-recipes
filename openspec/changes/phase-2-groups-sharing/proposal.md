## Why

Phase 1 installed the backend foundation (PostgreSQL, Prisma, JWT auth, recipe CRUD) and partially wired the frontend. However, groups and recipe sharing — the core social feature of the app — remain incomplete. The group backend has no DELETE endpoint, no membership management, and no authorization checks. The frontend group pages are stubs (create/edit have no forms), and the "Send to Group" drawer uses hardcoded mock data. This change completes groups & sharing so users can create groups, add members, and share recipes within groups.

## What Changes

- Add `DELETE /v1/groups/:id` endpoint with admin authorization
- Add `POST /v1/groups/:id/remove-recipe` endpoint to remove recipes from groups
- Add authorization checks to `PATCH /v1/groups/:id` — only admins (owner/co-owner) can edit the group. All members can send recipes via `POST /v1/groups/:id/recipes` and delete their own published recipes via `POST /v1/groups/:id/remove-recipe`
- Implement group membership endpoints: `POST /v1/groups/:id/members/:userId` (add) and `DELETE /v1/groups/:id/members/:userId` (remove)
- Hydrate `recipeIds` and `groupIds` fields in API responses (currently always empty arrays)
- Create fully functional frontend forms for Create Group and Edit Group pages
- Wire `SendRecipeDrawer` to live API data (replace mock group import)
- Add React Query mutations for create/update/delete group and add/remove recipe from group
- Add i18n keys for new form fields, membership, and notification messages
- Update `formatRecipe` to populate `groupIds` from `RecipeGroup` join table
- Update `GET /v1/groups/:id` response to hydrate `recipeIds` on the group object

## Capabilities

### New Capabilities

- `groups-crud`: Complete group CRUD endpoints (including delete, remove-recipe, authorization checks) and shared type alignment
- `group-membership`: Add and remove members from groups with membership-based visibility
- `groups-ui`: Frontend create/edit forms, send-to-group integration, and React Query mutation hooks for groups

### Modified Capabilities

- `database`: Group tables are no longer forward-compatibility placeholders — route handlers now use GroupMember membership for authorization and RecipeGroup for recipe associations. Existing tables are unchanged; the spec requirement "routes do not reference these tables" is removed.
- `recipe-crud`: The `formatRecipe` function now populates `groupIds` from the `RecipeGroup` join table. Recipe list visibility expands to include recipes in the user's groups (not just own + public).

## Impact

- **apps/api**: Add group delete, remove-recipe, and membership routes. Add owner authorization to existing group mutation routes. Update `formatRecipe` to include `groupIds`. Update recipe list query to include group-shared recipes.
- **apps/web**: Implement Create Group and Edit Group page forms. Replace mock data in `SendRecipeDrawer` with live API call. Add `useCreateGroup`, `useUpdateGroup`, `useDeleteGroup`, `useAddRecipeToGroup`, `useRemoveRecipeFromGroup` React Query hooks. Add new i18n keys across all locale files.
- **libs/shared**: `groupSchema` currently has `recipeIds: z.array(z.string())` but the field is never hydrated. Confirm schema alignment; no breaking changes needed since field already exists.
