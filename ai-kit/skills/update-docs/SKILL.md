---
name: update-docs
description: Write or refresh knowledge pages for code that changed. Use when the user asks "онови документацію", "напиши сторінку", "обнови документацию", "задокументируй", "update the docs", "document this", or runs /unity-ai:update-docs.
---

# Update the knowledge vault

Writes the pages that carry what the code cannot: invariants, contracts, gotchas, and why it is
this way. Read `${CLAUDE_PLUGIN_ROOT}/skills/update-docs/references/doctrine.md` before writing —
it is short, and it is the difference between a vault people read and one they stop trusting.

## Steps

1. Find the debt. Either what this branch changed:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/docs-map.mjs" --pending
   ```

   or, when starting the vault from nothing, what churns most:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/docs-map.mjs" --hotpath --top 20
   ```

   Churn is the honest ranking: the code that changes most is the code whose invariants get
   rediscovered most often.

2. Write or refresh the pages. Delegate to the `update-docs` agent when there is more than one
   page to do: reading a module, its imports and its callers is noisy work that belongs in its own
   context.

3. Stamp and index — a page without a current `source_hash` counts as stale forever:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/docs-map.mjs" --rehash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/docs-map.mjs" --build-index
   node "${CLAUDE_PLUGIN_ROOT}/scripts/docs-map.mjs" --lint
   ```

   `--lint` is the gate: broken `[[links]]`, orphan pages whose source is gone, oversized pages,
   name collisions. Fix what it reports before finishing.

4. Report which pages you wrote and which you deliberately left alone, with the reason. "Nothing
   non-obvious to say about this file" is a complete and acceptable reason.

## Do not

- Do not document everything that changed. A page per changed file produces a vault of restated
  code, which is worse than no vault: it costs tokens to read and goes stale silently.
- Do not refresh a page as a side effect of answering a question. Documentation is its own change,
  reviewed on its own.
