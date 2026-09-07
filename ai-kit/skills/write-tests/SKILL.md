---
name: write-tests
description: Write unit tests for existing code, by this repository's conventions and the coverage gate. Triggers: "покрий тестами", "покрой тестами", "add coverage".
---

# Write tests

Writes unit tests only. Not for implementing features, fixing bugs or explaining code — if the
code under test is wrong, say so and stop rather than testing the bug.

## Steps

1. Decide where the test belongs — this is not uniform across the packages and is the most common
   mistake. The table is in `<toolkit>/skills/write-tests/references/placement.md`; read it rather
   than guessing, and check whether a test file for that source already exists.

2. Delegate to the `write-tests` agent for anything beyond a single small function, passing the
   file paths, the package, and the placement from step 1. Reading the source, its imports and the
   neighbouring tests is noisy work that belongs in its own context.

3. Run the tests and report the result. A suite you have not run is not a deliverable.

## The gate this serves

Coverage is checked per changed diff section at 60% of changed executable lines, and coverage from
elsewhere does not compensate. Cover the changed behaviour specifically: a test that only imports
the module raises the number and catches nothing.
