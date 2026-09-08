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

1. Facts:

   ```shell
   node scripts/ai.mjs collect-evidence
   ```

2. Delegate to the `ssr-safety` agent with the evidence and the instruction to read
   `<toolkit>/rules/ssr.md` first.

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
