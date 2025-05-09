# Semantic Release Commit Guidelines

This document describes the commit message conventions used in our project to
enable [semantic-release](https://semantic-release.gitbook.io/semantic-release/) automation. These commit types
determine how the project version is incremented (major, minor, patch) and how the changelog is generated.

## Commit Message Format

Each commit message must follow the **Conventional Commits** specification, optionally including a JIRA task reference:

```
<type>[<scope>]: <JIRA-TICKET> - <short description>

<optional body>

<optional footer>
```

### Examples

```
feat(auth): XX-142 - add support for multi-step login
```

```
fix(build): XX-188 - resolve Vite production build issue
```

```
BREAKING CHANGE: XX-100 - rewrite auth module interfaces
```

## Commit Types and When to Use Them

| Type              | Description                                              | Version Impact |
|-------------------|----------------------------------------------------------|----------------|
| `feat`            | A new feature or capability                              | `minor`        |
| `fix`             | A bug fix                                                | `patch`        |
| `perf`            | A code change that improves performance                  | `patch`        |
| `refactor`        | Code restructuring without changing functionality        | `patch`        |
| `revert`          | Revert of a previous commit                              | `patch`        |
| `chore`           | Routine tasks (e.g., dependency updates, config changes) | `patch`        |
| `test`            | Adding or updating tests                                 | `patch`        |
| `style`           | Code style changes (formatting, no logic impact)         | `none`         |
| `docs`            | Documentation changes only                               | `none`         |
| `BREAKING CHANGE` | Introduces incompatible API changes                      | `major`        |

## Best Practices

- Always include the JIRA task code in the subject line to allow traceability.
- Use meaningful and concise descriptions.
- Use `BREAKING CHANGE:` for any incompatible API or behavioral changes.
- If a commit does not impact production code (e.g., `docs`), it should not trigger a release.
