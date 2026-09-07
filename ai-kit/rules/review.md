---
name: review
description: What a review must check in a diff. Single source for the local review skill and for the CI review rules.
appliesTo: all
---

# Review rules

This file is the single source for reviews: the local pre-push review and the GitLab CI review
read the same rules, so a comment that appears in one is not a surprise in the other.

## Order of attention

1. **Correctness.** Does the change do what the ticket asks, and does it break anything that
   worked? A finding is worth writing only when it names a concrete failure: the input or state,
   and the wrong output or crash that follows.
2. **Scope.** Does the diff contain work the ticket did not ask for — an unrelated refactor,
   a reformatted file, a dependency added in passing?
3. **SSR and hydration.** Browser access without a guard, markup that cannot match between server
   and client, client-only work moved into shared initialization.
4. **Tests.** Is the changed behavior actually exercised, and does each changed section meet the
   coverage gate? Import-only tests do not count.
5. **Shared code.** Does this belong in `unity-core-modules` instead of the application? If it
   stays in the application, will it now differ from the twin repository?
6. **i18n.** New copy goes through translation keys and the Lokalise flow, never hardcoded text.
7. **Leftovers.** Debug logging, commented-out code, secrets or tokens in the diff, `TODO`
   without a ticket reference.

## Do not

- Do not comment on formatting, quoting, import order or line length. `unity-eslint-config`
  owns those, and a review that spends its attention there misses the bug.
- Do not restate what the diff does. A summary is not a finding.
- Do not ask for a broad refactor inside the current ticket. If a fix needs one, say so and point
  at the technical-debt epic instead of blocking the change.
- Do not raise a hypothetical without a path to it. "This could be null" needs the call that
  passes null.
