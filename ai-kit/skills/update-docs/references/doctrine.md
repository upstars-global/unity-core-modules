# What a knowledge page is

A page exists to carry what a reader **cannot cheaply get from the code**. If a sentence can be
replaced by reading the file for ten seconds, it does not belong on the page.

## Write

- **Invariants and contracts.** What must always hold. What the caller is required to guarantee.
  What the function promises in return, including on failure.
- **Gotchas.** What breaks if you do the obviously right thing. This is the highest-value content
  on any page — it is exactly what is not in the code.
- **Why it is this way.** The constraint behind a decision that otherwise looks arbitrary: a
  backend quirk, an SSR requirement, a brand difference, a fix for a specific incident.
- **Order and coupling.** When calls must happen in a sequence, or state must be set before
  something else runs, and what happens when it is not.
- **Where the boundaries are.** What is deliberately not handled here, and who handles it.

## Do not write

- **A retelling of the file.** Lists of props, fields, signatures and exported names read worse
  than the code and go stale on the next commit.
- **Anything the types already say.** TypeScript is right there, and it does not drift.
- **Anything eslint enforces.**
- **Guesses.** If you cannot tell why something is the way it is, say the question is open. An
  honest gap is useful; a confident wrong reason gets copied into decisions.

## Shape

```
---
source: packages/front-ss/src/modules/Cashbox/CashboxForm/CashboxForm.vue
source_hash: <stamped by docs-map --rehash>
updated: <stamped by docs-map --rehash>
---

One or two sentences: what this is, in product terms.

## Invariants

- ...

## Gotchas

- ...

## Why

- ...
```

Link related pages as `[[PageName]]`. `--lint` fails on a link with no target, so link only what
exists.

**About 2 KB is the ceiling**, and `--lint` reports pages over it. That limit is not tidiness: a
page is read instead of the source, so a page as long as the source saves nobody anything. If a
module genuinely needs more, it usually needs two pages — or the module needs splitting.

Prose in Ukrainian; identifiers, paths, route names and code examples stay as they are.

## Where pages come from

The vault does not fill from documentation sprints. It fills from work that already happened and
cost something:

- a question `query-docs` had to answer from the source because no page existed;
- an SSR or review finding that named a durable trap, not just this diff's bug;
- a root cause that took reading three files to establish;
- a port or an extraction that revealed why the twins diverge here.

The test is one question: **would the next person rediscover this from scratch?** If yes, the
answer is worth a page, and the moment to write it is now, while the reasoning is still in
context — reconstructing it next month costs the same work again. If no — it is this branch's
detail, and it belongs in the MR, not in the vault.

The corollary is a limit. A finding that the code states plainly is not a page; a page that
restates the diff is worse than no page, because it will go stale and someone will trust it.
