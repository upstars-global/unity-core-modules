---
name: doctor
description: Report whether the unity-ai toolkit is installed correctly and what it can currently do. Use when the user asks "чи працює unity-ai", "перевір плагін", "работает ли плагин", "проверь unity-ai", "check the unity-ai plugin", "is the toolkit installed", or after installing or updating the plugin.
---

# unity-ai doctor

Verifies the plugin reached this repository and reports the state of the toolkit.
This skill exists for the stage-0 distribution spike; it is also the first thing to run
when someone reports that a unity-ai skill did not trigger.

## Steps

1. Run the probe and show its output verbatim:

   ```shell
   node "${CLAUDE_PLUGIN_ROOT}/scripts/selfcheck.mjs"
   ```

   If `${CLAUDE_PLUGIN_ROOT}` is empty in a plain shell, run the copy inside the checkout
   instead: `node ai-kit/scripts/selfcheck.mjs`.

2. Report the three things the spike is about, one line each:
   - the plugin manifest was found and its version;
   - whether `CLAUDE_PLUGIN_ROOT` was set when the `SessionStart` hook ran — the hook prints
     `unity-ai <version> is loaded.` at the start of every session in a repository that has
     the plugin enabled;
   - whether the repository root is reachable from the plugin directory. This decides whether
     deterministic scripts can live at the repository root (`scripts/ai/`, callable from
     `node_modules/unity-core-modules/scripts/ai/` in CI and husky) or must live inside the
     plugin only.

3. List what is available now: skills, agents and commands the plugin currently ships.
   In version 0.1.0 that is this skill and nothing else — say so plainly instead of
   listing planned work as if it existed.

## Do not

- Do not install, update or enable anything. This skill only reports.
- Do not guess at a cause when the probe fails. Print what failed and point at the plan
  (Confluence: Unity / FrontEnd / Unity AI Kit), which lists the fallback distribution scheme.
