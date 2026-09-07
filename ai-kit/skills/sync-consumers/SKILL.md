---
name: sync-consumers
description: Point both applications at a new unity-core-modules release — pin and lockfile. Triggers: "підніми пин", "подними пин", "bump the core pin".
---

# Point the applications at a new release

A release of `unity-core-modules` reaches nothing on its own: the applications follow a git tag, so
each needs its `package.json` pin and its `yarn.lock` entry moved. Doing that by hand is three
fiddly edits per repository, and a wrong lock resolves a different commit without telling anyone.

## Steps

1. Make sure the library checkout has the tag: `git fetch --tags` in `unity-core-modules`.

2. From that checkout:

   ```shell
   node ai-kit/scripts/sync-consumers.mjs --latest [--apps ../frontera ../king-front] [--dry-run]
   ```

   It rewrites the pin and the three lines yarn writes for a git dependency — key, version and the
   tag's commit. It is idempotent, and it **refuses** to touch the lock when the library's own
   dependencies changed between the two versions, because yarn then rewrites more than those three
   lines and guessing would corrupt the file.

3. Run `yarn install` in each application. This is not optional: it is the only thing that proves
   the lock resolves. If yarn rewrites it further, that rewrite is the truth — keep it.

4. Run each application's unit tests, and `yarn ai:agents-md --check`: a release that changed the
   toolkit's rules makes the generated `AGENTS.md` stale, and this is where you notice.

5. Commit per application, pin and lock together. Never one without the other.

## Also worth knowing

The plugin does not need this. Skills, agents, rules and hooks reach Claude Code through the
marketplace, which follows the library's default branch — so a merge is enough there, as long as
`plugin.json`'s version was bumped. The pin matters for what the repository itself runs: the
`AGENTS.md` generator, the rule paths written into `AGENTS.md`, and any script CI calls.

If the two channels disagree, the session-start line says so.
