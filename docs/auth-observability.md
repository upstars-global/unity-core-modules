# Auth telemetry: compact first slice

## Ownership

Alpa and King observe login and registration at their existing server proxy callbacks. Core observes client-only technical failures at the HTTP boundary and captcha helper. Each app's existing SentryController subscribes to one technical-error event after Sentry initialization.

- **Prometheus:** aggregate counts with fixed labels, not error text or user identifiers.
- **Loki:** failure/challenge diagnostics, not a second copy of every successful request.
- **Sentry:** actionable technical incidents, not invalid credentials, OTP, validation or ordinary challenges.

Extend an existing boundary first. Do not add request headers, a telemetry framework, per-form adapters or cross-request state just to label a new module.

## Signals

`auth_flow_total{flow,step,outcome,reason}` counts observed upstream auth responses, not unique people, UI submissions or completed sessions. Legacy metric definitions remain unchanged. King now invokes its previously disconnected `user_action_login` collector, without enabling Covery; `user_action_registration` continues using its existing labels.

Flows are `login` and `registration`. Steps are `password`, `otp`, `account_creation` and, when an existing request marker identifies it, `auto_login`. An OTP request without that marker remains `login/otp`; King auto-login is not distinguishable from ordinary login without changing its request contract.

Classification checks `required` containing `one_time_password`, then `errors.captcha`, then `errors.otp_attempt`, then HTTP status. Challenge is not success. The `errors.captcha` key follows the supplied task contract; verify it against a real backend rejection before relying on captcha dashboards. No free-text backend message becomes a new metric label.

`auth_captcha_generation_failure_total{flow,reason}` is separate from backend rejection. The existing `/log` receiver accepts only four combinations: login/registration × settings_timeout/sdk_error. It is a count of generation failures, not failed submissions: captcha generation can happen before a user submits a form, and client delivery is best-effort.

Server failures/challenges use `AUTH_FLOW_FAILURE` / `AUTH_FLOW_CHALLENGE`. Client failures use `AUTH_CLIENT_REQUEST_FAILURE` / `AUTH_CAPTCHA_GENERATION_FAILURE`. Request/service/HTTP duplicates are removed at these boundaries, not every log in every form. Legacy UI validation/auto-login logs and the OTP error signal remain; this is not a global logging rewrite.

Sentry receives fixed safe error descriptions, local `feature=auth`, `auth.flow`, `auth.step`, `auth.reason` tags, HTTP status when available, and a flow/step/reason fingerprint. Unexpected service exceptions use `step=client`, not a guessed failed backend operation. Raw request/response objects, backend messages, credentials and captcha tokens are not forwarded by this bridge. Breadcrumbs are cleared on its local scope. This intentionally sacrifices the original exception stack/message; it is not a global privacy filter for existing Sentry integrations.

## Behavior and boundaries

- Proxy response bodies, statuses and cookies are not rewritten by telemetry. Telemetry failures must not replace the original request error.
- Password login and registration require an object response in their existing callers; non-object successful responses are diagnostic failures without changing the returned value. OTP and explicitly marked auto-login responses are not shape-validated. King auto-login has no marker and is observed as password login, including this diagnostic check.
- Existing EE, Covery, geo guards, sockets, profile/bootstrap loading and logout behavior remain at the base branch version. Early responses outside the observed proxy callbacks are not represented by the new counter. Alpa login retains its original JSON.parse → EE check → metrics order: a parsing failure before that point is not counted by the new counter. Do not interpret its denominator as all attempts that reached the site.
- Captcha retry budget is local to each invocation: five settings checks and four 500 ms waits. SDK execution is not retried. Failure still returns undefined. This is the deliberate functional fix: the old shared counter eventually disabled generation across independent calls, including non-auth callers.
- Password reset, email confirmation, session expiration, bootstrap-stage metrics and social access checks are outside this slice.
- Local branch backups are `refs/backup/UN-3117-before-rebuild-20260925` in each repository. No history was pushed.

## Dashboard and delivery

Use `sum by(flow,step,outcome)(rate(auth_flow_total[5m]))` for volume and `sum by(flow,step,reason)(rate(auth_flow_total{outcome="failure"}[5m]))` for causes. Success ratio excludes challenge: success / (success + failure). Keep captcha generation counts separate from backend rejection ratios.

Validate real response classification and log delivery in a non-production environment. Collect at least seven days of baseline before enabling Slack alerts; alert on technical failures with minimum volume, a sustained interval and grouping, not each invalid password. No dashboards or active alerts are installed by this change.

The apps require the matching new core version. Local-source test aliases verify the coordinated source changes without altering node_modules. A core release, app pin/lock update, installed-version checks and deployment are separate authorized steps; passing local-source tests does not establish production integration.
