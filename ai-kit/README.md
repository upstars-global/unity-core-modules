# unity-ai

Shared Claude Code toolkit for the Unity front-end repositories: `frontera`, `king-front`
and `unity-core-modules` itself. Canonical home is this repository — edits made in a
consumer repository are either lost on the next `yarn install` or drift between the twins.

Plan and rationale: Confluence → space **Unity** → folder **FrontEnd** → *Unity AI Kit*.

## Status

`0.1.0` — stage 0 (distribution spike). Ships one skill, `doctor`, whose only job is to
prove the plugin arrives and that `${CLAUDE_PLUGIN_ROOT}` expands inside a hook. No
production skill exists yet; see the plan for the order in which they land.

## Layout

```text
.claude-plugin/marketplace.json   # marketplace catalogue, repository root
ai-kit/                           # the plugin itself
├── .claude-plugin/plugin.json    # plugin manifest
├── hooks/hooks.json              # SessionStart probe (cheap, non-blocking)
├── scripts/*.mjs                 # deterministic scripts, Node >= 22, no dependencies
└── skills/<name>/SKILL.md        # thin: inputs to collect, script to run, who to delegate to
```

Directories at the plugin root are auto-discovered: `skills/`, `agents/`, `commands/`,
`hooks/`. Only `plugin.json` belongs inside `.claude-plugin/`.

## Install in a consumer repository

Both repositories carry the marketplace and the plugin in a committed
`.claude/settings.json`, so a fresh clone needs no manual step beyond trusting the folder.
Plugins from an external source may still need one explicit install:

```shell
/plugin marketplace add upstars-global/unity-core-modules
/plugin install unity-ai@unity
```

Verify with `/unity-ai:doctor`, or from a shell: `node ai-kit/scripts/selfcheck.mjs`.

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
