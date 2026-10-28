---
name: wrap-it
description: Finish a completed OpenSpec change: sync delta specs, archive the change, commit, push to a proposal branch, and open a PR targeting develop. Use when implementation is done and verify is green, and the user wants the proposal wrapped up without spelling out each step.
---

Finish a completed, green OpenSpec proposal.

**Input**: a change name (kebab-case) and optionally a commit type
(`feat` | `fix` | `chore` | `refactor` | `test` | `docs`, default `fix`). If no
name is given, infer it from `openspec list --json` when exactly one active
change exists; otherwise ask.

**Preconditions (do not skip)**

- Implementation is complete and `yarn verify` (or `yarn verify:full` for
  API/DB work) is green. This skill does NOT re-run the sensors; it wraps work
  already verified.
- `openspec validate <change> --strict` passes.
- `tasks.md` has no unchecked `- [ ]` items (all `- [x]`).

## Steps (in order)

1. **Resolve the change name.** Run `openspec list --json`. If one active
   change, use it. If several, ask which one.

2. **Gate.** Run `openspec validate <change> --strict`. If it fails, stop and
   report — do not archive invalid specs.

3. **Sync + archive in one step.** Run:

   ```bash
   openspec archive <change> -y
   ```

   This applies delta specs to `openspec/specs/<capability>/spec.md` and moves
   the change to `openspec/changes/archive/<date>-<name>/`. Confirm the change
   is gone from `openspec list` and the main specs contain the new
   requirements.

4. **Branch.** From a clean, up-to-date base:

   ```bash
   git checkout -b <type>/<change-name>
   ```

   If the working tree already carries the changes, they come along. If the
   base is stale, `git pull --ff-only` first.

5. **Stage only intended files.** Review `git status` and stage the spec +
   code + test + config files for this change. Do NOT stage unrelated
   untracked artifacts (e.g. `.agents/`, lock files that are not yours).

6. **Commit.** Conventional Commits, imperative subject, body only when the
   "why" isn't obvious:

   ```bash
   git commit -m "<type>(api): <summary of the change>"
   ```

   If the change also introduces tooling (e.g. a skill), give it its own
   `chore` commit on the same branch.

7. **Push.**

   ```bash
   git push -u origin <branch>
   ```

8. **Open the PR against develop.**

   ```bash
   gh pr create --base develop --head <branch> \
     --title "<summary>" \
     --body "Closes the <change-name> change."
   ```

9. **Report.** Return the PR URL and a one-line summary of what was synced,
   archived, committed, and pushed.

## Guardrails

- Never archive or push a change whose verify is not green.
- Never force-push. If the push is rejected, pull and rebase, don't `--force`.
- Keep the branch name kebab-case and the commit type to the conventional set.
- Do not stage secrets or build artifacts (`.env`, `.next`, `dist`, `tmp`).
- If `gh pr create` fails, leave the branch pushed and report; don't retry
  blindly.
