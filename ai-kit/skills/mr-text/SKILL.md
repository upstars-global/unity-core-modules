---
name: mr-text
description: Write the merge-request title, description and author checklist. Triggers: "опиши MR", "назва MR", "название МРа", "merge request title", "PR description".
---

# MR text

Produces the title and the body to paste into a GitLab merge request or a GitHub pull request,
plus the checklist the author owes the reviewer. Nothing is pushed and no MR is created — `glab`
and `gh` are deliberately not part of this toolkit; the human presses the button.

## Steps

1. Facts first:

   ```shell
   node scripts/ai.mjs collect-evidence
   ```

2. Read the ticket if the branch names one, so the text says what the change is *for* and not only
   what it touches.

3. Write the **title** for the repository you are actually in — the two shapes are not
   interchangeable, because both repositories squash and the title becomes the commit:

   * **`frontera` / `king-front`** — `UN-1234: <короткий опис>`. Ticket key first, then the
     ticket's own summary shortened to fit; language of the ticket. Nothing else: no type prefix,
     no file names.
   * **`unity-core-modules`** — Conventional Commits, `type(scope): summary` in English, because
     `semantic-release` reads the squashed title to decide the release. The type is a decision,
     not a formality:

     | Title type | Release | Use when |
     | --- | --- | --- |
     | `feat` | minor | new export or new behaviour consumers can call |
     | `fix` | patch | wrong behaviour in something already released |
     | `chore`, `perf`, `refactor`, `test` | patch | internal change consumers can still pin to |
     | `docs`, `style` | **none** | text-only change |

     A `docs` or `style` title publishes no version, so the panels cannot pin the change. If the
     change must reach a consumer, the title must not be one of those two — say this out loud when
     the diff is mostly docs but carries something consumers need.

4. Write the **body** yourself — this needs no agent. Structure:

   ```
   ## Що зроблено
   <2–4 bullets in product terms, not a diff summary>

   ## Як перевірити
   <the shortest path a reviewer can take to see it work: URL, steps, expected result>

   ## Нюанси
   <anything a reviewer would otherwise have to discover: shared code touched, migration order,
   feature flag, follow-up left as a TODO — omit the section when there is nothing>
   ```

   When the evidence shows shared code touched (`unity-core-modules` exports, or files imported
   across workspaces), name the importers in `Нюанси`. That is the paragraph that saves a reviewer
   from finding out in production.

5. Add the author's checklist from the team's development flow, ticking only what is verifiably
   true from the evidence and leaving the rest for the author:

   - юніт-тести на змінену логіку (coverage gate по змінених секціях диффа);
   - e2e для змін у `front-core`;
   - дев-тест на динамічному стейджі, стейдж указаний у комментарі до задачі;
   - двоє рев'юерів (один — якщо зміна тривіальна), архітектурні зміни — на solaris;
   - задача кинута в `#front` після проходження дев-тесту.

6. Language: body and checklist in Ukrainian by default; the title follows step 3. If the ticket
   and the recent MRs of this repository are written in another language, match that and say so in
   one line.

## Do not

- Do not restate the file list. The diff is already in the MR.
- Do not claim a check passed unless the evidence shows it — an unticked box is honest, a ticked
  one that lied costs the reviewer their afternoon.
