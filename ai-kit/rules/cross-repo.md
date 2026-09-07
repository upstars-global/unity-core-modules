---
name: cross-repo
description: How the twins and the shared library relate, and where an edit belongs.
appliesTo: all
---

# Cross-repository rules

| Repository | Role | Default branch |
| --- | --- | --- |
| `frontera` | application (turborepo) | `master` |
| `king-front` | twin of the same application | `main` |
| `unity-core-modules` | shared library and this toolkit | `main` |

The applications pin the library by tag (`unity-core-modules#vX.Y.Z`), so a change in the library
reaches an application only after a release and a pin bump. The two applications drift: turbo
exists only in `frontera`, they live on different GitLab instances, they sit on different library
versions, and CI review is wired up in one of them. Assume nothing about the twin — check it.

- Decide once where a change belongs. Behavior needed by both applications belongs in
  `unity-core-modules`, not copied twice.
- A change that stays in one application and is needed by the other must be ported deliberately,
  and the port must report what could **not** be carried over: different base branch, different
  library version, files that do not exist there.
- Edits to this toolkit — rules, skills, agents, scripts — happen only in `unity-core-modules`.
  The same edit made in an application is lost on the next `yarn install` or drifts from the twin.
- Library code is library-style: no routes, pages, app-level providers or server-specific code
  unless the change explicitly requires them.
- Releasing the library follows conventional commits; `chore`, `fix`, `perf`, `refactor`, `test`
  produce a patch, `feat` a minor, `docs` and `style` no release at all.
