---
name: root-cause
description: Set the Jira "Root cause" field for a fixed bug by classifying the branch diff. Use when the user asks "проставь root cause", "першопричина бага", "первопричина бага", "root cause for this fix", or runs /unity-ai:root-cause.
---

# Root cause

Fills the Jira select **Root cause** after a bug fix, by reading the whole diff of the branch and
mapping the mechanism of the failure onto one of the field's own options.

Does nothing at all for non-bugs and for tickets whose issue type has no such field. That is a
feature: a wrong category is worse than an empty one.

## Steps

1. Ticket key from the branch name. No key, no work — say so and stop.

2. Gate on the issue type. Read the ticket; continue only for **Bug** and **Bug-Subtask**. For
   anything else, say which type it is and stop.

3. Read the field live, never from memory:
   `${CLAUDE_PLUGIN_ROOT}/skills/root-cause/references/field-discovery.md` describes how. You need
   the field id **and** its allowed options for this project — both differ between projects, and a
   hardcoded id is how this silently writes nothing.

4. Collect the diff facts:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/collect-evidence.mjs" --json
   ```

5. Delegate the classification to the `root-cause` agent. The prompt must contain the evidence
   JSON **and the exact list of allowed options** — the agent has no Jira access and cannot ask.
   It returns one option plus two or three sentences of reasoning, nothing else.

6. Write the field here, inline, not in the agent: a background agent cannot carry the user's
   intent into a write. Then read the field back and confirm it stuck. `editJiraIssue` can answer
   200 and drop a field that is not on this issue type's edit screen — when that happens, say so
   plainly rather than reporting success.

7. Offer a justification comment in Ukrainian, and post it only if the user says yes.

## Why the classification is delegated

The diff is noisy and the judgement is narrow — pick one category from a known list. That is worth
a cheap model in its own context, and it keeps the main window free for the Jira work, which needs
the user.
