---
name: query-docs
description: Answer how something works, reading the knowledge page before the source. Triggers: "як працює", "как работает", "how does X work".
---

# Query the knowledge vault

A page in `knowledge/` carries what the code cannot tell you — invariants, contracts, gotchas, and
why it is this way. When one exists and is fresh, reading it is both cheaper and more useful than
reading the source.

## Order of reading

1. In `frontera`, the `codebase-memory-mcp` graph answers *where* something is and *who* calls it.
   Use it for structure; it is faster than grepping.
2. Then the vault, for *why* and *what breaks*:

   ```shell
   node scripts/ai.mjs docs-map --find <Entity or path>
   ```

   `ok` — read the page and answer from it. `stale` or `no page` — read the source.
3. Then the source itself, always, if the answer is not fully in the page. A page is a summary of
   judgement, not a replacement for the code.

There is deliberately no vault index injected at session start. An index grows with the vault and
every session would pay for it whether or not anyone asks a question; a lookup costs one command
only when a question is actually asked.

## Answering

- Say where the answer came from — page or source. A reader has to know whether they are getting
  documented intent or your reading of the code.
- When the page is `stale`, say so and answer from the source. Then offer `/unity-ai:update-docs`;
  do not silently refresh it as part of answering a question.
- When there is no page and the answer took real work to reconstruct, offer to write one. That is
  how the vault fills up — from questions people actually asked, not from a documentation sprint.
