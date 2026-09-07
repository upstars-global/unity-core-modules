---
name: frontend
description: Vue 3 / Pinia / TypeScript conventions that hold in every Unity front-end repository.
appliesTo: all
---

# Frontend rules

- Vue 3, Pinia, TypeScript, ESM, Yarn, Node >= 22.
- The pattern already used in the file you are editing wins over the general rule. Read the
  surrounding code before writing.
- No new dependency without a reason stated in the merge request.
- Keep the change small and reviewable. No unrelated refactoring, no drive-by reformatting of
  lines the task does not touch.
- Pinia stores are setup stores: `defineStore("name", () => { ... })` with `ref`, `shallowRef`
  and `computed`, exposing state, computed values and actions from the callback. Keep mutations
  behind focused setter/action functions when the surrounding store already does that.
- Preserve SSR and client guards (`isServer`, `typeof window`, browser API checks). Never move
  browser-only work into module-level initialization of shared code.
- Reach for an existing helper, service, model or store API before adding an abstraction.
- Project aliases (`@config`, `@theme`, `@helpers`, `@modules`, `@plugins`, `@router`) are
  supplied by the consuming application. Shared code must stay compatible with them and with the
  test mocks that stand in for them.
- Formatting and style are enforced by `unity-eslint-config`. Do not hand-fix or discuss what
  `yarn lint` fixes.
