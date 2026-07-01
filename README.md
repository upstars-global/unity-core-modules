# unity-core-modules

Shared TypeScript modules for Vue 3 / Pinia frontend projects.

## Stack

- Node.js `>=22.22.0`.
- TypeScript with `strict` and `noImplicitAny`.
- Vue 3 and Pinia stores.
- Vite library build configured for `cjs`, `es`, and `umd` formats.
- Vitest for focused unit tests.

## Project Layout

- `src/controllers` - browser integrations, runtime controllers, and side-effectful helpers.
- `src/helpers` - reusable pure or mostly pure utilities.
- `src/models` - TypeScript models and enums shared by services and stores.
- `src/services` - API request wrappers and higher-level service functions.
- `src/store` - Pinia stores, mostly using setup-store syntax.
- `tests` - Vitest tests mirroring the `src` structure.
- `docs/ai-context` - instructions intended for AI coding agents.

## Commands

- `yarn test` - run Vitest.
- `yarn test:coverage` - run Vitest with coverage.
- `yarn lint` - run ESLint.
- `yarn lint:tsc` - run TypeScript checks.
- `yarn depcruise:check` - run dependency-cruiser thresholds.

## AI Context

Before changing code, read:

- `docs/ai-context/project-overview.md`
- `docs/ai-context/frontend-rules.md`
- `docs/ai-context/testing-rules.md`
