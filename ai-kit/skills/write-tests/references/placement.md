# Where a test file goes

Not uniform across the packages. Getting it wrong means the test either does not run or lands
somewhere a reviewer has to move it.

| Package | Test location |
| --- | --- |
| `packages/front-ss` | mirrored: `tests/unit/<same path as under src>/<Name>.test.ts` |
| `packages/front-core` | **next to the source**: `modules/Foo/helpers.test.ts` |
| `packages/server-*` | next to the source |
| `unity-core-modules` | mirrored: `src/store/foo.ts` → `tests/store/foo.test.ts` |

`front-ss` runs only `tests/**` — a test written next to the source there is silently never
executed, and its coverage never reaches the report.

If a test file for the touched source already exists, extend it instead of adding another.

## Method

1. Read the code under test, then follow what it actually depends on. Mock at the lowest useful
   boundary — usually the API request module — not at the store or component level.
2. Assert observable behaviour: returned values, emitted events, resulting state, calls to
   dependencies. Not internals, and not markup that carries no logic.
3. Reuse the mocks and helpers that already exist next to the code. Writing new ones when the
   repository has them is how a test suite becomes unmaintainable.
4. Pinia: `setActivePinia(createPinia())` in `beforeEach` unless the shared setup covers it.
5. Different module-level mocks in one file — an SSR branch and a client branch, say — need
   `vi.resetModules()` with dynamic imports.
6. Restore globals, timers and spies you stub.
7. Run the package's own test script and iterate until green.

The full team policy, with examples of what to test in a Vue 3 application, is the `unit-tests`
guide in the toolkit's `guides/` directory.
