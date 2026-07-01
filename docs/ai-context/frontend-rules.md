# Frontend rules

- Vue 3 / Pinia shared modules.
- This package is library-style code, not an app shell. Do not add routes, pages, app-level providers, or Nitro-specific code unless the requested change explicitly needs it.
- Follow existing patterns.
- Do not introduce new dependencies without reason.
- Keep changes small and MR-friendly.
- Avoid unrelated refactoring.
- Prefer setup-style Pinia stores (`defineStore("name", () => { ... })`) because that is the dominant local pattern.
- Keep state mutations behind focused setter/action functions when the surrounding store already follows that style.
- Preserve SSR/client guards such as `isServer`, `typeof window`, and browser API checks. Do not move browser-only work into shared module initialization.
- Keep project-specific alias imports (`@config`, `@theme`, `@modules`, `@plugins`, etc.) compatible with consuming projects and existing test mocks.
- Use existing helpers, services, DTOs, models, and store APIs before adding new abstractions.
- Follow current formatting: 4 spaces, double quotes, trailing commas, and 120 character print width.
