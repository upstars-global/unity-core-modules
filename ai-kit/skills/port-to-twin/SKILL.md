---
name: port-to-twin
description: Carry a change from one twin application to the other, reporting what cannot be carried. Use when the user asks "перенеси в king-front", "перенеси в frontera", "синхронізуй близнюка", "перенеси в близнеца", "port this to the twin", or "port to king-front".
---

# Port to the twin

`frontera` and `king-front` are the same application twice: about nine of ten component
directories exist in both. The surroundings are not the same, and that is what breaks ports —
different default branches, turbo in only one of them, a guides directory whose name is spelled
differently, and a shared-library pin that is not always equal.

So this is never a cherry-pick. It is: find out what is portable, port that, and say plainly what
was left behind.

## Steps

1. Establish the facts before touching anything:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/port-map.mjs" --commit <sha or range>
   ```

   Run it from the source repository. It prints the structural differences and a verdict per file:
   `identical` (ports cleanly today), `differs` (already diverged — decide per hunk),
   `missing-in-twin` (a new file, or the feature does not exist there), `deleted-here` (and whether
   the twin still has the file). Path renames are resolved, so a guide moves to the right place.

2. Show the user that verdict, grouped, before doing the work. A port they did not agree to the
   shape of is a port they will revert.

3. Create a branch in the twin from **its own** default branch — `main` for king-front, `master`
   for frontera. Never assume; `port-map.mjs` prints which is which.

4. Apply the change file by file, in this order of preference:
   - `identical` files: apply the same diff.
   - `differs` files: read both sides and apply the intent, not the diff. The twin's version has
     its own history and overwriting it is how a brand's customisation silently disappears.
   - `missing-in-twin`: add the file only if the feature belongs there. Ask if unsure — this is
     usually where a port turns into a product decision.

5. Adjust for the asymmetries `port-map.mjs` reported: a script that goes through turbo in
   frontera runs on the workspace directly in king-front; a path under `guides-md/` becomes
   `guids-md/`; a reference to `docs/ai-context/` has nowhere to point in king-front.

6. Run the twin's own lint and unit tests. Then report: what was ported, what was adapted and how,
   and what was **not** ported with the reason. That last list is the point of this skill.

## Do not

- Do not `git cherry-pick` across the repositories. They have unrelated histories and different
  remotes; it either fails or produces a commit nobody can trace.
- Do not port a change to i18n message files wholesale. Brand copy differs by design.
- Do not touch the twin's `unity-core-modules` pin as part of a port. That is `sync-consumers`.
