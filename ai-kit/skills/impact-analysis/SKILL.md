---
name: impact-analysis
description: Turn the branch into a list of pages QA must open, and optionally write it into Jira. Triggers: "що тестувати", "что тестировать", "impact analysis", /unity-ai:ia.
---

# Impact analysis

Produces a report for a **manual tester**: which pages to open, at which URL, and what to check on
each. Deliberately without code-level detail — the reader is QA, not the author of the change.

## Steps

1. Collect the facts. This is deterministic, so never do it by reading the diff yourself:

   ```shell
   node scripts/ai.mjs collect-evidence --json
   ```

   If the branch has no commits over the base, add `--working` to analyse uncommitted work, and
   say in the report that this is what you did.

2. Delegate the analysis to the `impact-analysis` agent, in one prompt containing: the JSON from
   step 1, the repository name, and the instruction to read
   `<toolkit>/skills/impact-analysis/references/playbook.md` first. The agent cannot
   ask questions, so nothing may be left implicit.

3. Give the agent's report back **verbatim**. Do not summarize it, do not add a preamble, do not
   re-order it. It is written for a person who will paste it into a ticket.

4. Offer the Jira write, and only then. Ask which of the three the user wants:
   - the **Impact analysis** field of the ticket (Bug, Feature and Research have it);
   - a **comment** on the ticket;
   - nothing.

   With no ticket key in the branch name, skip the offer entirely — there is nothing to write to.

5. Writing to Jira happens here, inline, never in the agent: a background agent cannot carry the
   user's intent into a write. Read the ticket's edit metadata first to find the field id — it
   differs per project and must never be hardcoded. Append under a dated heading instead of
   overwriting, then read the field back: `editJiraIssue` can answer 200 and silently drop a field
   that is not on that issue type's edit screen. If it did not stick, say so and offer the comment
   instead.

6. If the ticket is a bug, offer `/unity-ai:root-cause` at the end.

## Inputs

Nothing to ask for: the branch is the input. Ask only when step 1 finds no changes at all.
