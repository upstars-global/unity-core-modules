---
name: vue-component
description: Create a new Vue component with its unit test, and optionally a story and translation keys, in the places this repository puts them. Use when the user asks "новий компонент", "створи компонент", "новый компонент", "создай компонент", "create a component", "add a component", or "scaffold a component".
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
   node "${CLAUDE_PLUGIN_ROOT}/scripts/component-scaffold.mjs" \
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

## Conventions the skeleton already follows

- `<script setup lang="ts">` first, then `<template>` — the order the recent components use.
- Props through `defineProps` with an `interface`, defaults through `withDefaults`.
- Tailwind classes in the template; a `<style>` block only when Tailwind genuinely cannot do it.
- Tests: `mount` from `@vue/test-utils`, explicit vitest imports, alias imports for the component.
- New translation keys land in `src/i18n/messages/en.json` and nowhere else. Every other locale
  is pulled back from Lokalise after the merge request, so a key written into `de.json` by hand is
  lost on the next pull.
