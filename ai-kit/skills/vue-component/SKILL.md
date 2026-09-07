---
name: vue-component
description: Generate a component with its test, story and translation keys, where each package puts them. Triggers: "новий компонент", "новый компонент", "create a component".
---

# New Vue component

The files and their locations are generated, not written by hand — the layout differs per package
and getting it wrong means someone moves files later.

## Steps

1. Collect three things. Ask only for what is missing; do not guess a name.
   - **Name** in PascalCase (`FeBadge`, `VipProgressCard`).
   - **Package**: `front-ss` (application UI), `front-core` (shared between the twins),
     `server-core`, or `library` for `unity-core-modules` itself. When the user says "shared" or
     "for both projects", that means `front-core`, and say so.
   - **Directory** inside the package, as it will read in an import: `ui/FeBadge`,
     `components/FeBadge`, `modules/VipProgram/components/VipProgressCard`.

2. Generate the skeleton:

   ```shell
   node scripts/ai.mjs component-scaffold \
     --name FeBadge --package front-ss --dir ui/FeBadge [--story] [--i18n-keys BADGE.TITLE=Badge]
   ```

   Add `--story` only for a reusable UI component — a story for a one-off page block is noise.
   Add `--i18n-keys` when the component shows copy; the script writes them into `en.json` only.
   Use `--dry-run` first if the target directory is at all uncertain: the script refuses to
   overwrite, so a wrong path means cleaning up by hand.

3. Fill in the generated files. The skeleton is deliberately minimal — one prop, one emit, one
   test of each. Replace it with the real thing, and read a neighbouring component in the same
   directory first: that is where the current conventions live, not in this file.

4. Run the package's own test script on the new test, and lint the touched files. Do not report
   the component as done before both pass.

## Conventions

The skeleton already follows them, so do not restate them back to the user. Where it stops being
enough, the answer is in the neighbouring component in the same directory, and in the `frontend`
rule. The one thing worth repeating: new translation keys go into `src/i18n/messages/en.json` and
nowhere else — every other locale is pulled back from Lokalise and would lose them.
