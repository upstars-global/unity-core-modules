---
description: Point both applications at a new unity-core-modules release.
---

Run the `sync-consumers` skill.

Target version, if given: $ARGUMENTS

Follow its SKILL.md: edit the pin and the lockfile lines, and refuse the lockfile edit when the
library's own dependencies changed between the two versions — that one needs `yarn install`.
