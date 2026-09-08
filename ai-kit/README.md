# unity-ai

Shared Claude Code toolkit for the Unity front-end repositories: `frontera`, `king-front`
and `unity-core-modules` itself. Canonical home is this repository — edits made in a
consumer repository are either lost on the next `yarn install` or drift between the twins.

Plan and rationale: Confluence → space **Unity** → folder **FrontEnd** → *Unity AI Kit*.

## Status

`0.8.0` — stages 1–5, reviewed. Ships the shared rules (stage 1), the QA and Jira skills, the local review,
and the deterministic scripts they stand on. Wiring the review rules into the organisation's CI
review is a separate item, waiting on that job's own implementation.

## Skills

| Skill | Command | What it does |
| --- | --- | --- |
| `impact-analysis` | `/unity-ai:ia` | Branch to a manual-QA checklist of pages and checks, in Ukrainian, optionally written into the Jira ticket |
| `root-cause` | `/unity-ai:root-cause` | Classifies a bug-fix diff into the Jira Root cause option and writes it, after verifying the write stuck |
| `review` | `/unity-ai:review` | Reviews the branch against `rules/review.md` before anyone else sees it |
| `mr-text` | `/unity-ai:mr` | MR/PR title for this repository's convention, description and the author's checklist |
| `vue-component` | `/unity-ai:component <name>` | Generates a component, its test, optionally a story and translation keys, in the places each package puts them |
| `write-tests` | `/unity-ai:tests <path>` | Unit tests by the repository's conventions and the coverage gate |
| `ssr-safety` | `/unity-ai:ssr` | Audits a diff for browser assumptions and hydration mismatches |
| `i18n-keys` | `/unity-ai:i18n <keys>` | Translation keys the way the Lokalise flow requires |
| `port-to-twin` | `/unity-ai:port` | Carries a change into the twin and reports what could not be carried |
| `extract-to-core` | `/unity-ai:extract <path>` | Moves code into the shared library, with the blockers checked first |
| `sync-consumers` | `/unity-ai:sync [version]` | Points both applications at a new library release — pin and lockfile |
| `query-docs` | `/unity-ai:how <question>` | Answers from the knowledge page when one is fresh, from the source otherwise |
| `update-docs` | `/unity-ai:docs` | Writes the pages that carry invariants, gotchas and why — not a retelling of the code |

Every skill has a command, and the command is the supported way in: it says exactly which skill
runs, so nothing depends on guessing intent from a phrase. That is also why the `description`
fields are one clause — a description is loaded into every session whether or not the skill is
used, and a list of trigger phrases in three languages was paying that price to do what a command
does for free.

Agents are launched by the skills, never directly: `impact-analysis` and `code-review` on sonnet,
`root-cause` on the cheaper `fable` — its job is to pick one category from a known list. Every
agent is read-only, cannot ask questions, and returns only its result. Jira and git writes stay in
the skill, where the user's intent lives.

## Scripts

Deterministic, no dependencies, no network. Run them directly when you want the facts without a
model in the loop.

| Script | What it answers |
| --- | --- |
| `collect-evidence.mjs` | Ticket, base branch, changed files by kind and workspace, changed shared code and its importers, hinted Jira components. `--json` for an agent |
| `routes-map.mjs` | The router's real table: URL, route name, component module. `--for <file>` answers which pages render a changed file |
| `sync-agents-md.mjs` | Generates `AGENTS.md` from the rules; `--check` fails when it is stale |
| `rules-inject.mjs` | The SessionStart index of rules, plus a warning when the plugin and the pinned copy in `node_modules` have drifted apart |
| `component-scaffold.mjs` | Writes a component, its test, a story and `en.json` keys into the right places for the target package. Refuses to overwrite |
| `port-map.mjs` | How the twins differ, and a per-file verdict on whether a change can be carried across |
| `check-extract.mjs` | Whether a file can move into the library, and what has to happen first |
| `sync-consumers.mjs` | Rewrites the library pin and its lockfile entry in both applications |
| `docs-map.mjs` | The vault's deterministic core: which page documents a source, whether it is still true, what is missing, and what churns most |
| `budget.mjs` | What the toolkit costs in context, split into always-on and on-trigger. Run it before and after adding a skill |

## Layout

```text
.claude-plugin/marketplace.json   # marketplace catalogue, repository root
ai-kit/                           # the plugin itself
├── .claude-plugin/plugin.json    # plugin manifest
├── hooks/hooks.json              # SessionStart: inject the rule index (cheap, non-blocking)
├── rules/*.md                    # shared rules, one file per area, frontmatter drives the index
├── guides/*.md                   # long-form team policies referenced by the rules
├── scripts/*.mjs                 # deterministic scripts, Node >= 22, no dependencies
└── skills/<name>/SKILL.md        # thin: inputs to collect, script to run, who to delegate to
```

## Rules

A rule file is markdown with frontmatter: `name`, a one-line `description`, and `appliesTo`
(`all`, `apps` or `library`). Only the descriptions are injected at session start — the body is
read when the assistant works in that area, so the always-on cost stays a handful of lines.

That split is the point, and it is measurable: `node ai-kit/scripts/budget.mjs` prints what every
session pays for the toolkit existing (frontmatter and the SessionStart line) against what is only
paid when a skill actually runs. Adding a skill costs the first number a line; a long playbook
costs it nothing. Check it before and after adding anything.

Three consumers read the same files, which is the whole point:

| Consumer | How it gets them |
| --- | --- |
| Claude Code | `SessionStart` hook runs `scripts/rules-inject.mjs` and prints the index |
| Codex and friends | `AGENTS.md`, generated by `scripts/sync-agents-md.mjs` (`yarn ai:agents-md`) |
| GitLab CI review | `rules/review.md`, rendered into `CR_REVIEW_RULES` (from stage 2) |

`AGENTS.md` is generated, so never edit it: change the rule and run the generator. `--check`
exits non-zero when a repository's copy is stale, which is what CI will use.

Paths resolve themselves: inside this repository the rules are `ai-kit/rules/*`, and in a
consumer they are `node_modules/unity-core-modules/ai-kit/rules/*`.

Directories at the plugin root are auto-discovered: `skills/`, `agents/`, `commands/`,
`hooks/`. Only `plugin.json` belongs inside `.claude-plugin/`.

## Running the scripts

`${CLAUDE_PLUGIN_ROOT}` is only substituted inside `plugin.json` and `hooks.json`. In the body of
a `SKILL.md` it stays a literal, so a skill cannot address the scripts that ship with the plugin.
Each repository therefore carries one resolver, `scripts/ai.mjs` (copy of `ai-kit/templates/ai.mjs`),
and every skill calls scripts through it:

```shell
node scripts/ai.mjs                          # version, resolved toolkit path, available scripts
node scripts/ai.mjs collect-evidence --json
node scripts/ai.mjs docs-map --hotpath
```

It resolves the toolkit from the pinned package first, then from the checkout, then from
`CLAUDE_PLUGIN_ROOT` if it happens to be set — so it works in an application, in this repository,
and inside a hook.

## Install in a consumer repository

Both repositories carry the marketplace and the plugin in a committed
`.claude/settings.json`, so a fresh clone needs no manual step beyond trusting the folder.
Plugins from an external source may still need one explicit install:

```shell
/plugin marketplace add upstars-global/unity-core-modules
/plugin install unity-ai@unity
```

Verify from a shell in either application: `yarn ai` prints the plugin version, the toolkit
path it resolved and the scripts it can run.

## Develop against a checkout

```shell
claude --plugin-dir ./ai-kit     # loads this working copy, takes precedence over the installed one
claude plugin validate ./ai-kit  # same checks as the marketplace review pipeline
/reload-plugins                  # pick up edits without restarting
```

Bump `version` in `plugin.json` on every change that consumers should receive — without a
bump they keep the version they have.

## Rules for adding to this toolkit

1. Deterministic work goes in a script, not in the model. If the result follows entirely
   from the arguments, write `.mjs` — no tokens, nothing to get wrong.
2. `SKILL.md` stays thin: only what the main assistant needs. The long procedure goes in
   `references/playbook.md` and the working agent reads it itself.
3. `description` is a trigger list, written in the phrases people actually use
   (Ukrainian, Russian, English) — that is what makes a skill fire without a slash command.
4. An agent's final message is the result and nothing else: no preamble, no tool logs.
5. An agent cannot ask questions. Everything it needs arrives in the prompt; missing input
   means a documented default plus an explicit note that it was assumed.
6. Never hardcode Jira custom field ids. Read them live and re-read after writing.
7. Style is eslint's job, not a skill's. Do not restate what `unity-eslint-config` enforces.

## The knowledge vault

`knowledge/` in each repository holds one page per entity that has something non-obvious about it.
The tooling lives here, the pages live in the repository they describe.

Freshness is a hash of the source in the page's frontmatter, not its mtime: mtime changes on every
install and checkout, and would declare half the vault stale for nothing.

There is **no vault index injected at session start**, unlike the backoffice toolkit this one
learned from. An index grows with the vault and every session would pay for it whether or not
anyone asks a question. `docs-map.mjs --find` costs one command, only when a question is asked.

Start from `--hotpath`: the code that changes most is the code whose invariants get rediscovered
most often, and that ranking comes from git rather than from opinion.
