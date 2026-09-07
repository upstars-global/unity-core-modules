---
name: i18n-keys
description: Add or clean translation keys the way the Lokalise flow requires. Triggers: "додай ключі", "добавь ключи", "translation keys".
---

# Translation keys

The flow is the constraint here, not the file format: keys are added to the default language only,
Lokalise translates them after the merge request, and everything else is pulled back. A key
written into another locale by hand is lost on the next `yarn pull:i18n`.

## Adding keys

1. Write the key into `packages/front-ss/src/i18n/messages/en.json` — and nowhere else. Keep the
   existing nesting (`PROFILE.LIMITS_TAB.WIND_DOWN.TITLE` is four levels), keep keys sorted, and
   never overwrite an existing key.

   For a new component the scaffold does this deterministically:

   ```shell
   node scripts/ai.mjs component-scaffold --name X --dir ... \
     --i18n-keys PROFILE.NEW_BLOCK.TITLE=Title
   ```

2. Use the key in the template as `$t("PROFILE.NEW_BLOCK.TITLE")`, never inline copy.

3. Tell the user the rest of the flow, because it is theirs and not automatable from here: the
   merge request uploads the new `en.json` keys to Lokalise, the ticket goes to `translate`, and
   the team is told in the localisation chat that translations are awaited. Then
   `cd packages/i18n && yarn pull:i18n` brings the other locales back into the branch.

## Cleaning up

The repository has its own tool for finding unused and missing keys — `scripts/i18n-cleaning`.
Read its readme and run it rather than writing a new search; its output is the input to any
cleanup decision.

Never delete a key because a search did not find it: keys are also composed dynamically. Check for
the key's prefix being built in code before proposing a deletion, and propose rather than delete.
