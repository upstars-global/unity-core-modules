---
name: ssr
description: SSR and hydration rules for the application repositories — what breaks when code assumes a browser.
appliesTo: apps
---

# SSR rules

Every component renders on the server first and is then hydrated on the client. Most bugs in this
area come from code that quietly assumes a browser, or from server and client disagreeing about
what to render.

- No `window`, `document`, `localStorage`, `navigator` or media queries at module scope or in
  `setup()` without a guard. Move the access into `onMounted`, or behind an existing guard.
- Server and client must render the same markup for the same state. `Date.now()`, random values,
  locale- or geo-dependent values and viewport checks produce a hydration mismatch unless they are
  deferred to the client.
- Use the repository's own client-only mechanism (`ClientOnly`, lazy hydration) rather than
  inventing one. Check what the neighbouring pages already use.
- `context.js` is generated per request — locale, geo, request parameters, server state. It is not
  a static asset and must not be cached like one.
- Asset delivery, the service worker and cache policy have their own repository-local rules; when
  a change touches them, those rules and the asset-cache tech note take precedence over this file.
- Verify by hand: `yarn dev`, open the affected page, and check the console for hydration warnings
  and the Network tab for the requests the change should or should not make.
