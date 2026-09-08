---
name: review
description: Review the branch against the shared review rules before pushing. Run by /unity-ai:review.
---

# Review

Reviews the branch with the same rules the team uses in review, so that the first reader of an
obvious mistake is the author and not a colleague.

The rules are `<toolkit>/rules/review.md` — one source, shared with every repository.
When the organisation's CI review is wired up to the same file, both will say the same things;
until then this is the only automated pass, and it must not invent its own standards.

## Steps

1. Facts:

   ```shell
   node scripts/ai.mjs collect-evidence
   ```

2. Delegate to the `code-review` agent, passing the evidence and the instruction to read
   `<toolkit>/rules/review.md` first. Review is noisy work — reading a whole diff,
   opening neighbouring files — and it belongs in its own context.

3. Return the findings verbatim, ordered most severe first. If the agent found nothing, say that
   in one line. Do not pad an empty review with observations.

4. Do not fix anything unless the user asks: a review that rewrites the code being reviewed
   removes the author's choice.

5. If a finding named a durable trap rather than this diff's bug — a shared-state rule, an order
   of initialisation, a contract two packages rely on — offer one knowledge page for it and
   nothing more. That is the only follow-up worth adding to a review.
