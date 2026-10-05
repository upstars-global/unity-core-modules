# Claude Code instructions

@README.md
@package.json
@docs/ai-context/project-overview.md
@docs/ai-context/frontend-rules.md
@docs/ai-context/testing-rules.md

Work only inside the requested scope.
Before editing, inspect existing patterns.

## Shared rules

Rules that hold across `frontera`, `king-front` and this repository live in `ai-kit/rules/`.
The `unity-ai` plugin injects their index at session start; read a file when you work in its area.
`AGENTS.md` is generated from the same rules — edit the rules, not the generated file.
