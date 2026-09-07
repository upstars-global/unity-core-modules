---
name: testing
description: Unit-test conventions and the CI coverage gate. The full team policy lives in guides/unit-tests.md.
appliesTo: all
---

# Testing rules

The full policy — what to test in a Vue 3 app, with examples — is `../guides/unit-tests.md`.
It used to be duplicated in both application repositories, byte for byte; this is now the single
copy. Read it before writing a first test for an unfamiliar layer.

## Always

- Cover changed business logic. Do not add import-only or cosmetic tests to move a number.
- Mirror the source tree: `src/store/foo.ts` -> `tests/store/foo.test.ts`.
- Reuse the existing mocks and helpers instead of writing new ones.
- Mock at the lowest useful boundary — usually `src/services/api/requests/*` — when testing
  service or store orchestration.
- Keep tests deterministic: no real network, no wall-clock dependence, no unstable dependencies.
- Pinia: `setActivePinia(createPinia())` in `beforeEach`, unless the shared vitest setup already
  gives you a clean store.
- Use `vi.resetModules()` with dynamic imports when a test needs different module-level mocks,
  for example an SSR branch and a client branch.
- Restore globals, timers and spies you stub.
- Assert observable behavior — returned data, emitted events, resulting state, calls to
  dependencies — not implementation details.
- If the touched file already has a test file, extend that one rather than starting another.
- Changes limited to documentation, comments or agent-context files need no tests.

## CI coverage gate (application repositories)

Merge requests enforce coverage for changed runtime behavior, per changed diff section:

1. Changed executable lines in each changed section stay at or above 60%.
2. Coverage from another file or another section does not compensate for an uncovered section.
3. Type-only files, `/types/` directories, declaration files and spec files are excluded.
4. A mostly-markup Vue change that still carries behavior needs that behavior covered — through a
   component test or through the nearest isolated layer (composable, helper, store).

## When a correct test needs a refactor

If proper coverage would grow the task by more than about 15%:

1. Do not turn the task into an architectural refactor.
2. Leave a `TODO` next to the blocked area saying what refactor the test needs.
3. Open a follow-up in the technical-debt epic UN-2429 and reference it in the `TODO`.
4. Cover what can be covered safely within the agreed scope.
