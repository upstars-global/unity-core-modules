# Testing rules

- Add tests for changed business logic.
- Do not add meaningless tests for imports or cosmetic changes.
- Reuse existing mocks and helpers.
- Prefer focused unit tests.
- Use Vitest APIs (`describe`, `it`, `expect`, `vi`) consistently with nearby tests.
- Tests should mirror the source folder when possible: `src/store/foo.ts` -> `tests/store/foo.test.ts`, `src/helpers/foo.ts` -> `tests/helpers/foo.test.ts`.
- Pinia tests should initialize a fresh store state with `setActivePinia(createPinia())` in `beforeEach`, unless the shared `tests/vitest.setup.ts` behavior is enough.
- Mock API request modules at the lowest useful boundary, usually `src/services/api/requests/*`, when testing service/store orchestration.
- Use `vi.resetModules()` and dynamic imports when a test needs different module-level mocks, such as SSR/client branches.
- Restore globals, timers, and spies after tests that stub them.
- Prefer asserting observable state, returned data, emitted events, and called dependencies over implementation details.
- If a change only updates docs, comments, formatting, or AI-agent context files, code tests are not required.
