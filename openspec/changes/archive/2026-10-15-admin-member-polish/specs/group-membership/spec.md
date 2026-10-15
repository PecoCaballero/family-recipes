## REMOVED Requirements

### Requirement: Group admins can remove another admin

**Reason**: Admin-to-admin demotion is no longer permitted; the feature is being removed entirely.

**Migration**: Remove `DELETE /v1/groups/:id/admins/:userId`. The `DELETE /v1/groups/:id/members/:userId` endpoint (kick) remains, which also removes the `GroupAdmin` row when removing a member.
