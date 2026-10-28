-- Drop the legacy single-owner column. Group ownership was replaced by the
-- GroupAdmin join table (see 20260803174311_add_group_admin_table), but the
-- NOT NULL "ownerId" column was left behind, which makes every Group insert
-- fail on a database created from scratch via `prisma migrate deploy`.
ALTER TABLE "Group" DROP COLUMN IF EXISTS "ownerId";
