# Porting into the twin — playbook

Read this before touching the twin. The prompt already contains `port-map.mjs` output: the
structural differences and a verdict per file. Do not re-derive them.

## Branch

Create the branch in the twin from **its own** default branch — `main` for king-front, `master`
for frontera. `port-map.mjs` prints which is which; never assume.

## Apply, in this order of preference

1. **`identical`** — the file is byte-identical today, so apply the same diff.
2. **`differs`** — read both versions and apply the **intent**, not the diff. The twin's version
   has its own history; whatever it has that the source does not is usually a deliberate brand
   difference, not drift. Preserve it.
3. **`missing-in-twin`** — add the file only if the feature belongs there. This is where a port
   most often turns into a product decision; when it is not obvious, leave it and say so.
4. **`deleted-here`** — mirror the deletion only if the twin still has the file, which the verdict
   states.

## Adjust for the asymmetries

The verdict lists them; these are the ones that recur:

- **turbo** exists only in frontera. A script invoked as `yarn turbo run x --filter=@front/ss`
  there is `yarn workspace @front/ss x` in king-front.
- **guides** live in `guides-md/` in frontera and `guids-md/` in king-front. The typo is real.
- **`docs/ai-context/`** exists only in frontera, so a reference to it has nowhere to point.
- The **library pin** is not always equal. A ported change that needs a newer
  `unity-core-modules` needs the pin bumped first — that is `sync-consumers`, a separate change.

## Never

- `git cherry-pick` between the repositories. Unrelated histories, different remotes: it either
  fails or produces a commit nobody can trace.
- Port i18n message files wholesale. Brand copy differs by design.
- Commit or push. Leave the work in the twin's working tree for review.

## Finish

Run the twin's own lint and unit tests for the packages you touched. Then report three lists:
what was ported, what was adapted and how, and what was **not** ported with the reason. The third
list is the point of the exercise — an unported file is recoverable, a wrongly ported one is found
in production.
