---
name: mr-text
description: Write the merge-request description and the reviewer checklist for the current branch, following the team's development flow. Use when the user asks "опиши MR", "текст для MR", "готовий до ревю", "готов к ревью", "merge request description", or runs /unity-ai:mr-text.
---

# MR text

Produces the text to paste into a GitLab merge request, plus the checklist the author owes the
reviewer. Nothing is pushed and no MR is created — `glab` is deliberately not part of this
toolkit; the human presses the button.

## Steps

1. Facts first:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/collect-evidence.mjs"
   ```

2. Read the ticket if the branch names one, so the description says what the change is *for* and
   not only what it touches.

3. Write the text yourself — this needs no agent. Structure:

   ```
   ## Що зроблено
   <2–4 bullets in product terms, not a diff summary>

   ## Як перевірити
   <the shortest path a reviewer can take to see it work: URL, steps, expected result>

   ## Нюанси
   <anything a reviewer would otherwise have to discover: shared code touched, migration order,
   feature flag, follow-up left as a TODO — omit the section when there is nothing>
   ```

4. Add the author's checklist from the team's development flow, ticking only what is verifiably
   true from the evidence and leaving the rest for the author:

   - юніт-тести на змінену логіку (coverage gate по змінених секціях диффа);
   - e2e для змін у `front-core`;
   - дев-тест на динамічному стейджі, стейдж указаний у комментарі до задачі;
   - двоє рев'юерів (один — якщо зміна тривіальна), архітектурні зміни — на solaris;
   - задача кинута в `#front` після проходження дев-тесту.

5. Language: Ukrainian by default. If the ticket and the recent MRs of this repository are written
   in another language, match that instead and say so in one line.

## Do not

- Do not restate the file list. The diff is already in the MR.
- Do not claim a check passed unless the evidence shows it — an unticked box is honest, a ticked
  one that lied costs the reviewer their afternoon.
