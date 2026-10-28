/**
 * Decides whether the PostgreSQL connection should use TLS.
 *
 * The PrismaPg driver adapter forwards its config to node-postgres, which
 * requires an explicit `ssl` option for hosted databases. The decision is
 * derived from the `sslmode` query parameter so a single DATABASE_URL works
 * locally (no sslmode) and in production (`sslmode=require`).
 */
export function shouldUseTls(databaseUrl: string): boolean {
  try {
    const url = new URL(databaseUrl);
    return url.searchParams.get('sslmode') === 'require';
  } catch {
    return false;
  }
}
