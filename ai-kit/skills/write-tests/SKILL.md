---
name: write-tests
description: Write unit tests for existing code, following this repository's conventions and the coverage gate. Use when the user asks "напиши тести", "покрий тестами", "напиши тесты", "покрой тестами", "test this", "add coverage for", or "створи spec".
---

# Write tests

Writes unit tests only. Not for implementing features, fixing bugs or explaining code — if the
code under test is wrong, say so and stop rather than testing the bug.

## Steps

1. Establish where the test belongs. This differs per package and is the most common mistake:

   | Package | Test location |
   | --- | --- |
   | `packages/front-ss` | mirrored: `tests/unit/<same path as under src>/<Name>.test.ts` |
   | `packages/front-core` | **next to the source**: `modules/Foo/helpers.test.ts` |
   | `packages/server-*` | next to the source |
   | `unity-core-modules` | mirrored: `src/store/foo.ts` → `tests/store/foo.test.ts` |

   If a test file for the touched source already exists, extend it instead of adding another.

2. Read the rules and the neighbours: `${CLAUDE_PLUGIN_ROOT}/rules/testing.md` for what to test
   and the coverage gate, `${CLAUDE_PLUGIN_ROOT}/guides/unit-tests.md` for the full team policy
   with examples. Then read one existing test in the same directory — it shows the mocks and
   helpers to reuse.

3. Delegate the writing to the `write-tests` agent when the target is more than a single small
   function: reading the source, its imports and neighbouring tests is noisy work that belongs in
   its own context. Pass the file paths, the package, and the test location from step 1.

4. Run the tests and report the result. A test suite you have not run is not a deliverable.

## The gate this serves

Merge requests check coverage per changed diff section, at 60% of changed executable lines, and
coverage from elsewhere does not compensate. So cover the changed behaviour specifically; a test
that only imports the module raises the number and catches nothing.
