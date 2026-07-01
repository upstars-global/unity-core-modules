# Project overview

This repository contains shared TypeScript modules for Vue 3 / Pinia frontend projects. It is a library-style package, not an application shell.

## Runtime and tooling

- Package manager: Yarn.
- Node.js: `>=22.22.0`.
- Module type: ESM (`"type": "module"`).
- TypeScript: `strict`, `noImplicitAny`, `moduleResolution: "Bundler"`.
- Build: Vite library build.
- Tests: Vitest with setup in `tests/vitest.setup.ts`.
- Linting: ESLint 9 with `eslint-config-frontera` and `simple-import-sort`.

## Important commands

- `yarn test` - run unit tests.
- `yarn test:coverage` - run coverage, same command used in CI.
- `yarn lint` - run ESLint.
- `yarn lint:tsc` - run TypeScript checks.
- `yarn depcruise:check` - check dependency-cruiser thresholds.

## Source map

- `src/controllers` - runtime controllers and browser/service integrations.
- `src/helpers` - reusable utility functions.
- `src/models` - shared TypeScript models, DTO-adjacent interfaces, and enums.
- `src/services/api` - HTTP client, request functions, and API DTOs.
- `src/services` - higher-level service functions that call API request modules and update stores.
- `src/store` - Pinia stores using setup-store syntax.
- `src/plugins` - shared plugins such as `ConfigPlugin` and `EventBus`.
- `types` - project-level ambient/shared type declarations.
- `tests` - unit tests mirroring `src` folders plus shared mocks and setup.

## Import and alias context

- External project aliases such as `@config`, `@theme`, `@helpers`, `@modules`, `@plugins`, and `@router` are expected to be provided by consuming projects.
- Tests map several aliases to `tests/mocks` through `vite.config.ts`; add or reuse mocks there when touching code that depends on project-specific aliases.
- Prefer relative imports inside this package when importing local `src` modules unless an existing file nearby already uses an alias for that dependency.

## Architecture notes

- Pinia stores generally use `defineStore("storeName", () => { ... })` with `ref`, `shallowRef`, and `computed`.
- Stores expose state, computed values, and setter/action functions directly from the setup callback.
- `createUnityConfigPlugin` injects `$defaultProjectConfig` only into stores that opt in with `projectConfiguration: true`.
- API request modules live under `src/services/api/requests`; higher-level orchestration usually belongs in `src/services`.
- The HTTP client in `src/services/api/http.ts` is fetch-based and keeps axios-like request/response shapes for compatibility.
- Client requests retry selected network/timeout errors; server requests use a shorter timeout and do not retry.
- Event-level side effects are usually routed through `EventBus` and logged through `controllers/Logger`.

## Known current caveat

- `vite.config.ts` currently points the library build entry to `./src/index.ts`, but this file is absent in the current tree. Verify the intended public entry before changing build or export behavior.

