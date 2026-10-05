---
name: ssr-safety
description: Audit a change for browser assumptions and hydration mismatches. Run by /unity-ai:ssr.
---

# SSR safety

Audits the branch for the failure that costs this team the most time: code that assumes a browser,
or server and client disagreeing about what to render.

Applies to the application repositories. In `unity-core-modules` the same rules matter even more —
a browser assumption in shared code breaks both applications at once.

## Steps

1. Facts, and the deterministic part of the audit itself — never grep the diff for these by hand,
   the script already did it:

   ```shell
   node scripts/ai.mjs collect-evidence
   node scripts/ai.mjs ssr-scan --json
   ```

   `ssr-scan` greps the diff's added lines for the browser APIs that actually cause hydration bugs
   (`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `matchMedia`, `Date.now`,
   `Math.random`) and reports a `guarded?` hint per hit. It is a heuristic, not a verdict — it does
   not parse scope — but a changed file with zero hits needs no reading for points 1-2 of the rule.

2. Delegate to the `ssr-safety` agent with the evidence, the `ssr-scan` output, and the instruction
   to read `<toolkit>/rules/ssr.md` first. Tell it plainly: files in `ssr-scan`'s `clean` list need
   no read for points 1-2, only for points 3-5 (client-only placement, refetch flashes, effect
   order) if anything else about them looks worth a look; files in `hits` are where to start.

3. Return its findings verbatim. Each one names a file and line, what breaks, and when — on the
   server, on hydration, or only on a slow connection. A finding without that is not returned.

4. When the change touches assets, the service worker or caching, point at the repository's own
   `docs/ai-context/asset-cache-rules.md` as well: those rules win over the shared ones.

5. When a finding explains a mechanism that will trap the next person too — not just this
   diff — offer a knowledge page for it. An SSR trap rediscovered twice has already cost more
   than the page would have.

## What this cannot do

It reads code. It does not run the application, so it cannot see a real hydration warning — the
last word belongs to `yarn dev` and the browser console. Say that when the audit finds nothing:
"no browser assumptions in the diff" is not the same as "hydrates cleanly".
