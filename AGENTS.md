# AGENTS.md

Guidance for coding agents working in this repo. Keep it accurate — it is the
feed-forward half of the autonomy loop; the sensors (below) are the feedback half.

## What this is

Nx monorepo for a family recipe app.

| Project  | Path          | Stack                                                            |
| -------- | ------------- | ---------------------------------------------------------------- |
| `web`    | `apps/web`    | Next.js 14 (App Router), React 18, MUI, React Query, i18next     |
| `api`    | `apps/api`    | Express 4, Prisma 7, Postgres, JWT auth                          |
| `shared` | `libs/shared` | Zod schemas + shared types (imported as `@family-recipe/shared`) |

Package manager **Yarn 4** (node-modules linker). Node 22.

## Commands

```bash
yarn install                      # install deps
yarn dev                          # run api + web dev servers
yarn verify                       # THE sensor suite: lint + typecheck + test + build
yarn verify:full                  # verify + hermetic api e2e (needs docker postgres)
```

Per-project:

```bash
nx lint <project>        nx typecheck <project>       nx test <project>
nx build <project>       nx serve <project>           nx run api:e2e
# projects: web, api, shared
```

## The loop (how to work here)

1. Read `AGENTS.md` + the relevant code and specs.
2. Make the smallest change that satisfies the task.
3. Run **`yarn verify`** and read failures. Fix and repeat until green.
4. For API/DB behavior also run **`yarn verify:full`**.
5. Only then report done. **Do not commit/push unless explicitly asked.**

Sensors, in order of speed: `lint` (incl. module-boundary / arch fitness) →
`typecheck` → `test` → `build` → `e2e`. All must pass. A red sensor is a blocked
task, not a footnote.

## Testing

- **Jest** (`ts-jest`). Configs: `apps/api/jest.config.cjs`, `apps/web/jest.config.cjs`,
  `libs/shared/jest.config.cjs`. Specs live beside sources as `*.spec.ts(x)`.
- Spec files are excluded from production `tsconfig.json` and included via
  `tsconfig.spec.json` (which adds the `jest` types). Add new specs matching
  `src/**/*.spec.ts(x)`.
- `web` runs in `jsdom` with `@testing-library/react` (+ `jest-dom` via
  `apps/web/jest.setup.ts`). `api`/`shared` run in `node`.
- **API e2e** (`nx run api:e2e`) is self-contained: drops/creates
  `family_recipes_test`, applies migrations, seeds, boots the API on `:4002`,
  exercises a group-sharing flow, tears down. Overrides: `E2E_DB_CONTAINER`,
  `E2E_DB_NAME`, `E2E_PORT`.

## Architecture boundaries

Projects are tagged (`scope:web|api|shared`, `type:app|lib`) and Nx enforces
`@nx/enforce-module-boundaries` as part of `nx lint`:

- apps may only depend on libs — never on another app
- `web` and `api` may depend on `shared`; `shared` depends on nothing internal

A violation fails `lint`. Fix the import direction; don't add an exception.

## Database & migrations

- Postgres via `docker-compose.yml` (container `family-recipes-db`, `:5432`).
- Schema: `apps/api/prisma/schema.prisma`; generated client: `apps/api/src/generated`
  (**do not hand-edit**).
- Apply migrations: `cd apps/api && npx prisma migrate deploy`. Seed: `npx prisma db seed`.
- **Any schema change needs a migration.** The e2e target runs against a database
  built purely from `prisma migrate deploy` + seed, so drift between
  `schema.prisma` and the migration history will surface there.

## Spec workflow (OpenSpec)

Product changes are spec-driven. Use the OpenSpec skills/commands:

```bash
openspec list                     # active changes
openspec validate <change> --strict
openspec archive <change> -y      # syncs delta specs + moves to changes/archive
```

Skills: `openspec-propose`, `openspec-apply-change`, `openspec-explore`,
`openspec-sync-specs`, `openspec-archive-change`. Tooling-only work does not need
a change proposal.

## i18n

UI strings live in `apps/web/src/app/_i18n/locales/`. **Add every new key to all
five locales**: `en`, `es`, `fr`, `de`, `pt`. Missing keys fall back to `en` and
are considered incomplete.

## Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`),
  imperative subject, body only when the "why" isn't obvious. One logical change
  per commit.
- **Formatting**: Prettier (`.prettierrc`). **Lint**: ESLint flat config
  (`eslint.config.mjs`), zero warnings tolerated.
- **Husky** pre-commit runs `lint-staged` (`eslint --fix` + `prettier --write` on
  staged files). Fix issues rather than bypassing with `--no-verify`.
- Prefer editing existing files; keep diffs small and focused.

## Gotchas

- `apps/web/.next`, `dist`, `tmp`, `coverage` are build artifacts and are
  git-ignored + lint-ignored. Never commit them.
- `tmp/` is used by `nx serve` for generated tsconfigs.
- Never commit secrets. `.env` files are git-ignored; `.env.example` documents vars.
- React hooks rules are enforced (`react-hooks/*`). Sync/reset state from props with
  the "adjust state during render" pattern, not `useEffect`.

## Definition of done

`yarn verify` is green (and `yarn verify:full` for API/DB changes), new behavior
has tests, all five locales are updated for new UI strings, and the diff is
minimal and focused.
