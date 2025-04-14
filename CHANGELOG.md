## [1.16.1](https://github.com/upstars-global/unity-core-modules/compare/v1.16.0...v1.16.1) (2025-04-14)

### 🐛 Bug Fixes

* (UN-1098): Limit retries in captcha generation to prevent infinite loops ([#149](https://github.com/upstars-global/unity-core-modules/issues/149))
 ([d839202](https://github.com/upstars-global/unity-core-modules/commit/d8392025c381d52860350ed6201db75c18612988))



    Limit retries in captcha generation to prevent infinite loops

    Added a retry counter to cap recursion at 5 attempts in `generateCaptcha`. Also adjusted the timeout duration to 500ms for efficiency. This prevents potential infinite loops and improves error handling.

    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.16.0](https://github.com/upstars-global/unity-core-modules/compare/v1.15.0...v1.16.0) (2025-04-10)

### 🚀 Features

* **UN-763:** cashbox amount change logic ([#127](https://github.com/upstars-global/unity-core-modules/issues/127))
 ([2d39a11](https://github.com/upstars-global/unity-core-modules/commit/2d39a11781da2e8722643e1789a79050e2807ebd))



    * feat: UN-763: add currency config for deposit buttons

    * update currency codes

    * fix: UN-1015

    * fix: max value

    * fix down calculation

    * fix min value

    * fix

## [1.15.0](https://github.com/upstars-global/unity-core-modules/compare/v1.14.1...v1.15.0) (2025-04-09)

### 🚀 Features

* UN-984: add AutocompleteFormController ([#134](https://github.com/upstars-global/unity-core-modules/issues/134))
 ([96ab5bf](https://github.com/upstars-global/unity-core-modules/commit/96ab5bf9147589a056b833091ec41f81af239edc))



    * New feature: add AutocompleteFormController

## [1.14.1](https://github.com/upstars-global/unity-core-modules/compare/v1.14.0...v1.14.1) (2025-04-08)

### 🐛 Bug Fixes

* UN-1078 fix sortBanners ([#146](https://github.com/upstars-global/unity-core-modules/issues/146))
 ([06baacf](https://github.com/upstars-global/unity-core-modules/commit/06baacfdea916162151acd1a506e49b8cc75e855))

## [1.14.0](https://github.com/upstars-global/unity-core-modules/compare/v1.13.0...v1.14.0) (2025-04-07)

### 🚀 Features

* UN-1061 new banners in tournaments ([#141](https://github.com/upstars-global/unity-core-modules/issues/141))
 ([0ef2f44](https://github.com/upstars-global/unity-core-modules/commit/0ef2f44940264d94c18ec44ebb743e9e27ad86fa))



    * feat: UN-1061 new banners in tournaments

## [1.13.0](https://github.com/upstars-global/unity-core-modules/compare/v1.12.2...v1.13.0) (2025-04-07)

## [1.12.2](https://github.com/upstars-global/unity-core-modules/compare/v1.12.1...v1.12.2) (2025-04-04)

### 🐛 Bug Fixes

* UN-1063 "ua-parser-js" version rollback ([#142](https://github.com/upstars-global/unity-core-modules/issues/142))
 ([5fbd565](https://github.com/upstars-global/unity-core-modules/commit/5fbd5653fe4491787ce2b24229409bc3207d706e))

## [1.12.1](https://github.com/upstars-global/unity-core-modules/compare/v1.12.0...v1.12.1) (2025-04-02)

### 🐛 Bug Fixes

* UN-1059 fix getActiveClass ([#140](https://github.com/upstars-global/unity-core-modules/issues/140))
 ([0bce252](https://github.com/upstars-global/unity-core-modules/commit/0bce2523b4b67f80efde65d96530831c7376a1df))



    * fix: UN-1059 fix getActiveClass

## [1.12.0](https://github.com/upstars-global/unity-core-modules/compare/v1.11.0...v1.12.0) (2025-04-02)

### 🚀 Features

* UN-817 banner config ([#132](https://github.com/upstars-global/unity-core-modules/issues/132))
 ([2a1c70a](https://github.com/upstars-global/unity-core-modules/commit/2a1c70a081a9ccbec8f6ec9ca37fc87cfb7717c3))



    * feat: UN-817 banner config

## [1.11.0](https://github.com/upstars-global/unity-core-modules/compare/v1.10.0...v1.11.0) (2025-04-01)

### 🔧 Maintenance

* UN-601: обновление пакетов (минорные/патчи) ([#136](https://github.com/upstars-global/unity-core-modules/issues/136))
 ([2db767b](https://github.com/upstars-global/unity-core-modules/commit/2db767b3f0d1c40d234540866f86bda526948453))

## [1.10.0](https://github.com/upstars-global/unity-core-modules/compare/v1.9.1...v1.10.0) (2025-04-01)

### 🚀 Features

* add useContentParser composable helper to replace variables in … ([#131](https://github.com/upstars-global/unity-core-modules/issues/131))
 ([62a258d](https://github.com/upstars-global/unity-core-modules/commit/62a258d466776bce993e7e25e89dc0787c08f0eb))



    * feat: add useContentParser composable helper to replace variables in text

    * fix after review

## [1.9.1](https://github.com/upstars-global/unity-core-modules/compare/v1.9.0...v1.9.1) (2025-04-01)

### 🐛 Bug Fixes

* Modify metaHrefLangsLink for new seo-AU ([#139](https://github.com/upstars-global/unity-core-modules/issues/139))
 ([8cbd747](https://github.com/upstars-global/unity-core-modules/commit/8cbd7477c2510ede31a04e62844ae93cabcc21c0))



    modify metaHrefLangsLink

## [1.9.0](https://github.com/upstars-global/unity-core-modules/compare/v1.8.0...v1.9.0) (2025-03-31)

### 🚀 Features

* UN-726 reapply ([#137](https://github.com/upstars-global/unity-core-modules/issues/137))
 ([1c2de5b](https://github.com/upstars-global/unity-core-modules/commit/1c2de5bb0960b488d52e26bc5ebf16faa88e5817))

, closes [#133](https://github.com/upstars-global/unity-core-modules/issues/) [#133](https://github.com/upstars-global/unity-core-modules/issues/) [#135](https://github.com/upstars-global/unity-core-modules/issues/)

## [1.8.0](https://github.com/upstars-global/unity-core-modules/compare/v1.7.1...v1.8.0) (2025-03-27)

### 🚀 Features

* Revert of "feat(UN-726): add configStore to be able to set games limit (… ([#135](https://github.com/upstars-global/unity-core-modules/issues/135))
 ([403bb64](https://github.com/upstars-global/unity-core-modules/commit/403bb642efb1aa47aa7aa8379757f56d605af819))

, closes [#133](https://github.com/upstars-global/unity-core-modules/issues/)

## [1.7.0](https://github.com/upstars-global/unity-core-modules/compare/v1.6.0...v1.7.0) (2025-03-27)

### 🚀 Features

* **UN-726:** add configStore to be able to set games limit ([#133](https://github.com/upstars-global/unity-core-modules/issues/133))
 ([62ff9f7](https://github.com/upstars-global/unity-core-modules/commit/62ff9f7d9d03cd55465af72c6d8d2722190a1f4e))



    * feat(UN-726): add configStore to be able to set games limit

    * feat: replace DEFAULT_PAGE_LIMIT with gamesPageLimit from config store in gameProviders store

## [1.6.0](https://github.com/upstars-global/unity-core-modules/compare/v1.5.3...v1.6.0) (2025-03-25)

### 🚀 Features

* UN-675 wheel tabs ([#109](https://github.com/upstars-global/unity-core-modules/issues/109))
 ([b49a32c](https://github.com/upstars-global/unity-core-modules/commit/b49a32ca34b5555ae52a730fa0b95baaf0547604))



    * feat: UN-675 wheel tabs

## [1.5.3](https://github.com/upstars-global/unity-core-modules/compare/v1.5.2...v1.5.3) (2025-03-21)

### 🐛 Bug Fixes

* add prefix to externalId for freshChat
 ([2fc6e1d](https://github.com/upstars-global/unity-core-modules/commit/2fc6e1d5f7ecd6c044e79e09a2f493a0f16b921b))



    * UN-1007: disable send ID user for init FreshChat

    * fix test

    * add prefix to externalId for freshChat

## [1.5.1](https://github.com/upstars-global/unity-core-modules/compare/v1.5.0...v1.5.1) (2025-03-20)

### 🐛 Bug Fixes

* UN-998 add optional param to sendPostMessageToParent ([#128](https://github.com/upstars-global/unity-core-modules/issues/128))
 ([a41cf86](https://github.com/upstars-global/unity-core-modules/commit/a41cf86d2a9d55ea4f070dc864a8030bcbb73022))

## [1.5.0](https://github.com/upstars-global/unity-core-modules/compare/v1.4.0...v1.5.0) (2025-03-20)

### 🚀 Features

* disable redirectToLang in iframe &  add waiter to sendPostMessa…
 ([055fefb](https://github.com/upstars-global/unity-core-modules/commit/055fefb87fd27797d46e7f120a8afdf99bfe7a13))



    feat: disable redirectToLang in iframe &  add waiter to sendPostMessageToParent

    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.4.0](https://github.com/upstars-global/unity-core-modules/compare/v1.3.0...v1.4.0) (2025-03-18)

### 🚀 Features

* UN-209 pwa store
  ([0937c2a](https://github.com/upstars-global/unity-core-modules/commit/0937c2a857c7750ca0261dd03ae6464ed040a3e4))

    * feat: UN-209 pwa store

## [1.3.0](https://github.com/upstars-global/unity-core-modules/compare/v1.2.1...v1.3.0) (2025-03-18)

### 🧪 Testing

* test-semantic-release ([#124](https://github.com/upstars-global/unity-core-modules/issues/124))
  ([162d5e0](https://github.com/upstars-global/unity-core-modules/commit/162d5e0ab2474700e371d4eb682e323f63745fe4))

    - test semantic release

## [1.2.1](https://github.com/upstars-global/unity-core-modules/compare/v1.2.0...v1.2.1) (2025-03-18)

### 🐛 Bug Fixes

* fresh-chat restore id response handling
  ([3a52d85](https://github.com/upstars-global/unity-core-modules/commit/3a52d85557cec43d258733492ed52ff9a11917f2))

    * fix: add project name to loadFreshChatRestoreId

    * fix set fresh restore id logic

    * fix: tests

    * fix: destructuring response with fresh chat restore id

## [1.2.0](https://github.com/upstars-global/unity-core-modules/compare/v1.1.11...v1.2.0) (2025-03-17)

### 🚀 Features

* add semver to protected branch ([#122](https://github.com/upstars-global/unity-core-modules/issues/122))
  ([2447568](https://github.com/upstars-global/unity-core-modules/commit/2447568a05166b3e3c317428efb5885fab4a2623))

## [1.1.10](https://github.com/upstars-global/unity-core-modules/compare/v1.1.9...v1.1.10) (2025-03-10)

### 🐛 Bug Fixes

* add missed GBP currency required in king ([#118](https://github.com/upstars-global/unity-core-modules/issues/118))
  ([8587b5a](https://github.com/upstars-global/unity-core-modules/commit/8587b5ac052bd9ece3e019c743b95c0903fe5266))

    Closes: UN-914

## [1.0.0](https://github.com/upstars-global/unity-core-modules/compare/v0.2.0...v1.0.0) (2025-02-21)

### ⚠ BREAKING CHANGES

* add SemVer (#99)

### 🚀 Features

* add SemVer ([#99](https://github.com/upstars-global/unity-core-modules/issues/99))
  ([6770e5a](https://github.com/upstars-global/unity-core-modules/commit/6770e5a55a1dad883f0daa0e34a527655739b58e))

    * feat: add SemVer

    * feat: add changelog-template-commit.hbs

    **BREAKING CHANGE**: add SemVer (#99)
