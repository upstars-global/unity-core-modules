## [1.41.0](https://github.com/upstars-global/unity-core-modules/compare/v1.40.0...v1.41.0) (2025-10-21)

### 🚀 Features

* **UN-364:** refactor redeemableCompPointsStore & statusCompPointsStore and cover them with tests  ([#236](https://github.com/upstars-global/unity-core-modules/issues/236))
 ([462a1b6](https://github.com/upstars-global/unity-core-modules/commit/462a1b61698e2922aa57aaebe496b5a480af88e3))



    * fix: types

    * refactor: move requests from redeemableCompPointsStore to service

    * refactor: move requests from statusCompPointsStore to service

    * test: redeemableCompPointsStore

    * test: statusCompPointsStore

    * fix: checkHasAvailableCards

    * fix: import

## [1.40.0](https://github.com/upstars-global/unity-core-modules/compare/v1.39.0...v1.40.0) (2025-10-20)

### 🚀 Features

* **UN-1506:** Social registration via Google (MVP Logic) ([#220](https://github.com/upstars-global/unity-core-modules/issues/220))
 ([0728035](https://github.com/upstars-global/unity-core-modules/commit/0728035c19af275088b4cfc4054729138e4b2845))



    * feat: UN-1506

    * fix

    * feat: accept terms for social regs

    * feat: add check for user group who set password

    * fix(UN-1749): accept country filed when registered via social media

    * fix: imports for another product

## [1.39.0](https://github.com/upstars-global/unity-core-modules/compare/v1.38.0...v1.39.0) (2025-10-15)

### 🚀 Features

* refactor questsStore, add tests for promoHelpers, questsStore, questHelpers  ([#231](https://github.com/upstars-global/unity-core-modules/issues/231))
 ([e521c14](https://github.com/upstars-global/unity-core-modules/commit/e521c1437ecd818cf52f45739d81145e697c261e))



    feat: refactor questsStore, add tests for questStore, promoHelpers, questHelpers

## [1.38.0](https://github.com/upstars-global/unity-core-modules/compare/v1.37.1...v1.38.0) (2025-10-06)

### 🚀 Features

* remove axios usage ([#229](https://github.com/upstars-global/unity-core-modules/issues/229))
 ([8352b2a](https://github.com/upstars-global/unity-core-modules/commit/8352b2a4dc371ebb6d4d138ad3d85ff3f72e8a0b))

## [1.37.1](https://github.com/upstars-global/unity-core-modules/compare/v1.37.0...v1.37.1) (2025-10-06)

### ⏪ Reverts

* Revert "test: context & winners stores unit tests ([#232](https://github.com/upstars-global/unity-core-modules/issues/232))" ([#234](https://github.com/upstars-global/unity-core-modules/issues/234))
 ([e3b80a9](https://github.com/upstars-global/unity-core-modules/commit/e3b80a960a666a3b0f2411f0b6ed6cbf2f775c12))



    This reverts commit 3a59714e429fed4531d2d0c9886ad5326e43c273.

### 🧪 Testing

* context & winners stores unit tests ([#232](https://github.com/upstars-global/unity-core-modules/issues/232))
 ([3a59714](https://github.com/upstars-global/unity-core-modules/commit/3a59714e429fed4531d2d0c9886ad5326e43c273))



    * feat: add winners store tests

    * test: add context store test
* context & winners stores unit tests ([#235](https://github.com/upstars-global/unity-core-modules/issues/235))
 ([92b15a4](https://github.com/upstars-global/unity-core-modules/commit/92b15a482523c85ca3c1cfa31631f99e0de70551))

## [1.37.0](https://github.com/upstars-global/unity-core-modules/compare/v1.36.1...v1.37.0) (2025-10-02)

### 🚀 Features

* Vip program ([#230](https://github.com/upstars-global/unity-core-modules/issues/230))
 ([e334acb](https://github.com/upstars-global/unity-core-modules/commit/e334acb9ad55dea753e8334ea0f4e3753db2c909))

, closes [#225](https://github.com/upstars-global/unity-core-modules/issues/) [#227](https://github.com/upstars-global/unity-core-modules/issues/)

    * UN-1405 vip-program

    * UN-1405 vip-program

    * feat: load vip-program rewards config

    * fix: add rewards export to levelsStore

    * fix: rewards interface

    * UN-1405 vip-program

    * UN-1405 vip-program

    * added levelCards

    * UN-1527 vip-program

    * UN-1527 vip-program

    * UN-1533 refactor vip computeds and level interfaces

    * Revert "UN-1533 refactor vip computeds and level interfaces"

    This reverts commit 01cfadc042c71c96808cc18a737e5213f9bf117b.

    * UN-1533 refactor vip computeds and level interfaces

    * add levelBonusesCount, getUserVerified

    * add levelBonusesCount, getUserVerified

    * fix

## [1.36.0](https://github.com/upstars-global/unity-core-modules/compare/v1.35.1...v1.36.0) (2025-09-29)

### 🚀 Features

* refactor & tests of lotteries store ([#222](https://github.com/upstars-global/unity-core-modules/issues/222))
 ([0b9b713](https://github.com/upstars-global/unity-core-modules/commit/0b9b713eed3b009ca243c72bb2a2539fe358cf1b))

## [1.35.1](https://github.com/upstars-global/unity-core-modules/compare/v1.35.0...v1.35.1) (2025-09-25)

### 🐛 Bug Fixes

* mapping levels for new vip program levels ([#226](https://github.com/upstars-global/unity-core-modules/issues/226))
 ([038d25d](https://github.com/upstars-global/unity-core-modules/commit/038d25d8a25df077777f6304cc8a144fa23c55fa))

## [1.35.0](https://github.com/upstars-global/unity-core-modules/compare/v1.34.2...v1.35.0) (2025-09-24)

### 🚀 Features

* UN-1598: new random game logic ([#223](https://github.com/upstars-global/unity-core-modules/issues/223))
 ([b4aee7f](https://github.com/upstars-global/unity-core-modules/commit/b4aee7f0833a2c4102d769deecb7f5a922c892c4))



    * new random game logic

    * done

    * fix minor

    * remove test data

## [1.34.2](https://github.com/upstars-global/unity-core-modules/compare/v1.34.1...v1.34.2) (2025-09-22)

### 🔨 Refactoring

* UN-1449: refactor minor UTM params ([#224](https://github.com/upstars-global/unity-core-modules/issues/224))
 ([374c13f](https://github.com/upstars-global/unity-core-modules/commit/374c13f567a958182c0f5688c61b5637ad5de191))



    done

## [1.34.1](https://github.com/upstars-global/unity-core-modules/compare/v1.34.0...v1.34.1) (2025-09-12)

### 🧪 Testing

* add unit test for multilang
 ([3322ad1](https://github.com/upstars-global/unity-core-modules/commit/3322ad116851643406ee0248e5621d30be9d5f33))



    add unit test for multilang

## [1.33.0](https://github.com/upstars-global/unity-core-modules/compare/v1.32.1...v1.33.0) (2025-09-02)

### ⏪ Reverts

* Revert "feat: refactor lootboxes store, unit tests for lootboxes, roc… ([#214](https://github.com/upstars-global/unity-core-modules/issues/214))
 ([57d1ab3](https://github.com/upstars-global/unity-core-modules/commit/57d1ab386302c647c6eb4a2b0b1a3c23f44bd77a))

, closes [#210](https://github.com/upstars-global/unity-core-modules/issues/)

### 🚀 Features

* refactor lootboxes store, unit tests for lootboxes, rocketLootboxes, CMS stores ([#210](https://github.com/upstars-global/unity-core-modules/issues/210))
 ([5381e0e](https://github.com/upstars-global/unity-core-modules/commit/5381e0e746687331ad465dda92f21275c06c759a))



    * feat(UN-345): CMS unit tests

    * fix: CMS test

    * feat: refactor lootboxes store wip

    * feat: refactor lootboxes store

    * feat: refactor lootboxes store

    * feat: add lootboxes and rocketLootboxes stores tests
* refactor lootboxes store, unit tests for lootboxes, rocketLootboxes, CMS stores ([#215](https://github.com/upstars-global/unity-core-modules/issues/215))
 ([c055bf4](https://github.com/upstars-global/unity-core-modules/commit/c055bf41bb437dce76d1a6aec43b8fe9c0e9509e))

, closes [#214](https://github.com/upstars-global/unity-core-modules/issues/)

## [1.32.1](https://github.com/upstars-global/unity-core-modules/compare/v1.32.0...v1.32.1) (2025-08-27)

### 🧪 Testing

* add unit tests for bannerHelpers functions ([#211](https://github.com/upstars-global/unity-core-modules/issues/211))
 ([2dec3a4](https://github.com/upstars-global/unity-core-modules/commit/2dec3a4a4cdc624dffcd2a10fa56d0236a0b8bcd))



    test: add unit tests for achievementHelpers functions

    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.32.0](https://github.com/upstars-global/unity-core-modules/compare/v1.31.5...v1.32.0) (2025-08-20)

### 🚀 Features

* add providers config and filtering functionality
 ([bcabaf7](https://github.com/upstars-global/unity-core-modules/commit/bcabaf7ab90dc36dc05b98ae6efd0bbae21bf4ed))

, closes [#198](https://github.com/upstars-global/unity-core-modules/issues/)

## [1.31.5](https://github.com/upstars-global/unity-core-modules/compare/v1.31.4...v1.31.5) (2025-08-18)

### 🔨 Refactoring

* gameSearch
 ([5c10be7](https://github.com/upstars-global/unity-core-modules/commit/5c10be777e8f724a2ab74064451ffc5ff1a90b00))



    UN-835

## [1.31.4](https://github.com/upstars-global/unity-core-modules/compare/v1.31.3...v1.31.4) (2025-08-12)

### ⏪ Reverts

* "refactor: gamesSearch" ([#207](https://github.com/upstars-global/unity-core-modules/issues/207))
 ([95a721c](https://github.com/upstars-global/unity-core-modules/commit/95a721c4a27fea8e76465acd226640570bdc741a))



    This reverts commit a5969859cdc21bdd432826f83a7db6956c4a9bda.

## [1.31.3](https://github.com/upstars-global/unity-core-modules/compare/v1.31.2...v1.31.3) (2025-08-12)

### 🔨 Refactoring

* gamesSearch
 ([a596985](https://github.com/upstars-global/unity-core-modules/commit/a5969859cdc21bdd432826f83a7db6956c4a9bda))



    UN-835

## [1.31.2](https://github.com/upstars-global/unity-core-modules/compare/v1.31.1...v1.31.2) (2025-08-12)

### 🔧 Maintenance

* UN-1350 clear UserManager ([#206](https://github.com/upstars-global/unity-core-modules/issues/206))
 ([aaa0e40](https://github.com/upstars-global/unity-core-modules/commit/aaa0e40502dd50220c622adcf9e3d5f4fbcc548b))

## [1.31.1](https://github.com/upstars-global/unity-core-modules/compare/v1.31.0...v1.31.1) (2025-08-07)

### 🔧 Maintenance

* UN-1317 mock data ([#193](https://github.com/upstars-global/unity-core-modules/issues/193))
 ([33ff5c9](https://github.com/upstars-global/unity-core-modules/commit/33ff5c98d84fe12eaf615653992f594494ee1f51))



    * chore: UN-1317 mock data

## [1.31.0](https://github.com/upstars-global/unity-core-modules/compare/v1.30.1...v1.31.0) (2025-08-04)

### 🚀 Features

* **UN-1452:** load and use betting config from cms ([#201](https://github.com/upstars-global/unity-core-modules/issues/201))
 ([d1e2f16](https://github.com/upstars-global/unity-core-modules/commit/d1e2f1671dc53291157b72fab7de268aeadc44df))



    * feat(UN-1452): load and use betting config from cms

## [1.30.1](https://github.com/upstars-global/unity-core-modules/compare/v1.30.0...v1.30.1) (2025-08-01)

### ⏪ Reverts

* Revert "feat(UN-1438): axios error format" ([#200](https://github.com/upstars-global/unity-core-modules/issues/200))
 ([c3cc448](https://github.com/upstars-global/unity-core-modules/commit/c3cc4486ee0f13d7bf16dfa9a8456b22afef7dde))

, closes [#197](https://github.com/upstars-global/unity-core-modules/issues/)

## [1.30.0](https://github.com/upstars-global/unity-core-modules/compare/v1.29.1...v1.30.0) (2025-08-01)

### 🚀 Features

* **UN-1438:** axios error format ([#197](https://github.com/upstars-global/unity-core-modules/issues/197))
 ([1470acc](https://github.com/upstars-global/unity-core-modules/commit/1470acc3eb6dc6df397a9acaf4a694f59d8d4e27))



    * UN-1438 axios error format

    * remove log

## [1.29.1](https://github.com/upstars-global/unity-core-modules/compare/v1.29.0...v1.29.1) (2025-07-23)

### 🐛 Bug Fixes

* **UN-119:** axios compability for delete requests ([#196](https://github.com/upstars-global/unity-core-modules/issues/196))
 ([3aca358](https://github.com/upstars-global/unity-core-modules/commit/3aca3581c25da44e46d51ac39f51986ac78ba045))



    * UN-119 fetch instead of axios

    * remove axios from package.json

    * chore: update yarn.lock

    * UN-119 improve params

    * UN-119 fix document uploading

    * UN-119 fix sign_up with accept header

    * UN-119 fix empty response from patch

    * UN-119 delete method compatibility with axios

## [1.29.0](https://github.com/upstars-global/unity-core-modules/compare/v1.28.9...v1.29.0) (2025-07-23)

### 🚀 Features

* (UN-119) fetch instead of axios ([#190](https://github.com/upstars-global/unity-core-modules/issues/190)) [#88](https://github.com/upstars-global/unity-core-modules/issues/88) ([#195](https://github.com/upstars-global/unity-core-modules/issues/195))
 ([3c6992b](https://github.com/upstars-global/unity-core-modules/commit/3c6992b1ba43f1ae101ca49ac87051bda31fd8a1))



    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.28.9](https://github.com/upstars-global/unity-core-modules/compare/v1.28.8...v1.28.9) (2025-07-16)

### 🐛 Bug Fixes

* **UN-1229:** added check for logged user and native pwa support ([#182](https://github.com/upstars-global/unity-core-modules/issues/182))
 ([3635376](https://github.com/upstars-global/unity-core-modules/commit/3635376daab101b2c63105ebd9577d26ca0e3042))


* **UN-1229:** updated lock file ([#192](https://github.com/upstars-global/unity-core-modules/issues/192))
 ([5812abe](https://github.com/upstars-global/unity-core-modules/commit/5812abed47b99eee658dc65cd0bd7a3dd8a672d3))

## [1.28.8](https://github.com/upstars-global/unity-core-modules/compare/v1.28.7...v1.28.8) (2025-07-11)

### 🔧 Maintenance

* UN-1312 update IBannerConfig ([#191](https://github.com/upstars-global/unity-core-modules/issues/191))
 ([a6b5243](https://github.com/upstars-global/unity-core-modules/commit/a6b52439e665a52adf8eb14b83b1e70416687b10))

## [1.28.7](https://github.com/upstars-global/unity-core-modules/compare/v1.28.6...v1.28.7) (2025-07-10)

### 🔧 Maintenance

* Un 996 ([#187](https://github.com/upstars-global/unity-core-modules/issues/187))
 ([b769d5d](https://github.com/upstars-global/unity-core-modules/commit/b769d5da866f4da6c312d2b5998497a3dec370d1))



    chore: UN-996 rocket mart discount

## [1.28.6](https://github.com/upstars-global/unity-core-modules/compare/v1.28.5...v1.28.6) (2025-07-10)

### 🐛 Bug Fixes

* **UN-1290:** extended MainWidgetItem type ([#189](https://github.com/upstars-global/unity-core-modules/issues/189))
 ([8e54bce](https://github.com/upstars-global/unity-core-modules/commit/8e54bcea95ad17eb816c01a376106d7244e1dd42))



    fix(UN-1229): extended MainWidgetItem type

## [1.28.5](https://github.com/upstars-global/unity-core-modules/compare/v1.28.4...v1.28.5) (2025-07-09)

### 🔧 Maintenance

* UN-1201 add widget type ([#186](https://github.com/upstars-global/unity-core-modules/issues/186))
 ([1b95525](https://github.com/upstars-global/unity-core-modules/commit/1b9552540c96228b5d7e0f596d10d48baf6b78f4))



    Co-authored-by: zeroequalzero <d.zavadskyi@upstars.com>

## [1.28.4](https://github.com/upstars-global/unity-core-modules/compare/v1.28.3...v1.28.4) (2025-06-27)

### 🐛 Bug Fixes

* **UN-1309:** turned off pwa events ([#188](https://github.com/upstars-global/unity-core-modules/issues/188))
 ([c7407b7](https://github.com/upstars-global/unity-core-modules/commit/c7407b737a9e7f00cbfdeabed935324564d9d508))



    fix(UN-1309): turned off pwa events

## [1.28.3](https://github.com/upstars-global/unity-core-modules/compare/v1.28.2...v1.28.3) (2025-06-26)

### 🔧 Maintenance

* add GA helper
 ([34b70b9](https://github.com/upstars-global/unity-core-modules/commit/34b70b924be239c8770eeff80b53f4e9e9354de1))



    done

## [1.28.2](https://github.com/upstars-global/unity-core-modules/compare/v1.28.1...v1.28.2) (2025-06-18)

### 🔨 Refactoring

* (UN-1172) Simplify PWA event handling logic ([#185](https://github.com/upstars-global/unity-core-modules/issues/185))
 ([2740550](https://github.com/upstars-global/unity-core-modules/commit/2740550eb0a37964ab0c9cce1f692793b5d5e459))



    Streamline PWA event logic by moving user group updates into the sendPWAEvent function. This improves modularity and ensures separation of concerns for better maintainability.

    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.28.1](https://github.com/upstars-global/unity-core-modules/compare/v1.28.0...v1.28.1) (2025-06-18)

### 🐛 Bug Fixes

* (UN-1172) Add user login check before sending PWA events ([#184](https://github.com/upstars-global/unity-core-modules/issues/184))
 ([a9a8115](https://github.com/upstars-global/unity-core-modules/commit/a9a811575b94c973ef5701bd5b52b3bc65882101))



    Ensure PWA events are only sent for logged-in users by introducing a check using the user store. This prevents unnecessary event requests and aligns with user authentication requirements.

    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.28.0](https://github.com/upstars-global/unity-core-modules/compare/v1.27.2...v1.28.0) (2025-06-18)

### 🚀 Features

* UN-1012 add betting service ([#178](https://github.com/upstars-global/unity-core-modules/issues/178))
 ([fc28c12](https://github.com/upstars-global/unity-core-modules/commit/fc28c1298a77c6a36786eb3e1772c8af8b59d5e2))



    * feat: UN-1012 add betting service

    * feat: UN-1012 add betting service

## [1.27.2](https://github.com/upstars-global/unity-core-modules/compare/v1.27.1...v1.27.2) (2025-06-18)

### 🐛 Bug Fixes

* import log in src/services/cashbox.ts
 ([5c37009](https://github.com/upstars-global/unity-core-modules/commit/5c37009d29e2563ccc3d23abd8f799ef49b483a5))

## [1.27.1](https://github.com/upstars-global/unity-core-modules/compare/v1.27.0...v1.27.1) (2025-06-17)

### 🐛 Bug Fixes

* **UN-1229:** adding user to group if while opening pwa ([#175](https://github.com/upstars-global/unity-core-modules/issues/175))
 ([8a204e6](https://github.com/upstars-global/unity-core-modules/commit/8a204e6ed41b145d4b1fb89b250fa0f21af35861))



    * fix(UN-1229): adding user to group if while opening pwa

    * fix(UN-1229): removed logs

    * fix(UN-1229): added missing import

## [1.27.0](https://github.com/upstars-global/unity-core-modules/compare/v1.26.1...v1.27.0) (2025-06-16)

### 🚀 Features

* **UN-943:** request and fill store with betting player settings data ([#176](https://github.com/upstars-global/unity-core-modules/issues/176))
 ([c7322ab](https://github.com/upstars-global/unity-core-modules/commit/c7322abe1e2da4e1654fc03ac2d9f420f0883849))



    * feat(UN-943): request and fill store with betting player settings data

    * fix: export bettingPlayerSettings

## [1.26.1](https://github.com/upstars-global/unity-core-modules/compare/v1.26.0...v1.26.1) (2025-06-12)

### 🐛 Bug Fixes

* missing log import in gifts service ([#177](https://github.com/upstars-global/unity-core-modules/issues/177))
 ([8194859](https://github.com/upstars-global/unity-core-modules/commit/819485904c9182524859ec32968954783670d7c3))

## [1.26.0](https://github.com/upstars-global/unity-core-modules/compare/v1.25.3...v1.26.0) (2025-06-12)

### 🚀 Features

* **UN-363:** refactor gifts store and cover it with test ([#171](https://github.com/upstars-global/unity-core-modules/issues/171))
 ([d61deb7](https://github.com/upstars-global/unity-core-modules/commit/d61deb7e8b9cb72271cba963f4511acca0d7ec42))



    * feat(UN-363): move requests from store to services

    * feat: cover with test

    * feat: move http requests from service to requests file and cover gifts service with tests

    * fix(UN-1236)

    * fix: modify-gifts-config

    * fix: deposit bonus bug caused by refactor gifts store

## [1.25.3](https://github.com/upstars-global/unity-core-modules/compare/v1.25.2...v1.25.3) (2025-06-05)

### 🔨 Refactoring

* Un 347 ([#168](https://github.com/upstars-global/unity-core-modules/issues/168))
 ([51e2841](https://github.com/upstars-global/unity-core-modules/commit/51e2841ef03bef80a31a6ec7569e587ac14159ad))



    * refactor: UN-347 refactor cashbox and write tests

## [1.25.2](https://github.com/upstars-global/unity-core-modules/compare/v1.25.1...v1.25.2) (2025-06-04)

### 🐛 Bug Fixes

* **hotfix:** added default export ([#174](https://github.com/upstars-global/unity-core-modules/issues/174))
 ([0c9a029](https://github.com/upstars-global/unity-core-modules/commit/0c9a02945178912f90979c76482b11ae51fb972f))

## [1.25.1](https://github.com/upstars-global/unity-core-modules/compare/v1.25.0...v1.25.1) (2025-06-03)

### 🐛 Bug Fixes

* **UN-1230:** added check for destructure in widgets request ([#173](https://github.com/upstars-global/unity-core-modules/issues/173))
 ([7dd45b1](https://github.com/upstars-global/unity-core-modules/commit/7dd45b10b130819d6a9289ca793215cc4f332545))

## [1.25.0](https://github.com/upstars-global/unity-core-modules/compare/v1.24.1...v1.25.0) (2025-06-03)

### 🚀 Features

* **UN-1106:** added new api for main widget config ([#161](https://github.com/upstars-global/unity-core-modules/issues/161))
 ([40ed6d1](https://github.com/upstars-global/unity-core-modules/commit/40ed6d16c6a660d0262e934b384e6b8bfa080999))



    * feat(UN-1106): added new api for main widget config

## [1.24.1](https://github.com/upstars-global/unity-core-modules/compare/v1.24.0...v1.24.1) (2025-05-28)

### 🐛 Bug Fixes

* **UN-1213:** fixed fetchDeleteGameFromFavorites request method type ([#170](https://github.com/upstars-global/unity-core-modules/issues/170))
 ([5d9d4f0](https://github.com/upstars-global/unity-core-modules/commit/5d9d4f054d1128ebbbda78bf8f339872d9a279c3))

## [1.24.0](https://github.com/upstars-global/unity-core-modules/compare/v1.23.1...v1.24.0) (2025-05-28)

### 🚀 Features

* **UN-1142:** modified new endpoint for pwa events ([#162](https://github.com/upstars-global/unity-core-modules/issues/162))
 ([17146ca](https://github.com/upstars-global/unity-core-modules/commit/17146cab49313af0c5ca70acb381ee3eac68f5c7))



    * feat(UN-1142): added new endpoint for pwa events

    * feat(UN-1142) added check for logged user for pwa events

    * feat(UN-1142): added subscription for mode standalone MQL

    * feat(UN-1142): added isServer check for MQL subscription

## [1.23.1](https://github.com/upstars-global/unity-core-modules/compare/v1.23.0...v1.23.1) (2025-05-27)

### 🔨 Refactoring

* Upgrade dependencies and update semantic-release config ([#169](https://github.com/upstars-global/unity-core-modules/issues/169))
 ([d36e8d5](https://github.com/upstars-global/unity-core-modules/commit/d36e8d5f723150735e376468a1d72e4d12d19997))



    Updated Octokit packages to their latest versions, ensuring compatibility and security improvements. Refactored `release.config.js` to use consistent single quotes across the file, aligning with the preferred code style.

    Co-authored-by: d-tashchi <kabak133@gmail.com>

## [1.22.3](https://github.com/upstars-global/unity-core-modules/compare/v1.22.2...v1.22.3) (2025-05-23)

### 🐛 Bug Fixes

* UN-1199 fix lootboxes ([#163](https://github.com/upstars-global/unity-core-modules/issues/163))
 ([ecd0c9d](https://github.com/upstars-global/unity-core-modules/commit/ecd0c9d406902cb4be53d47f32f240f77c5b2a22))



    * fix: UN-1199 fix lootboxes

## [1.22.2](https://github.com/upstars-global/unity-core-modules/compare/v1.22.1...v1.22.2) (2025-05-15)

### 🔧 Maintenance

* Refactor and fix questStore
 ([4b9fb0b](https://github.com/upstars-global/unity-core-modules/commit/4b9fb0b23c2ed32155649910976774e43dff7595))



    * done

    * fix

    * feat: UN-1045

    * modify loadQuestDataReq

    * fix findNextLevelData

    * fix max level

    * remove mock

## [1.22.1](https://github.com/upstars-global/unity-core-modules/compare/v1.22.0...v1.22.1) (2025-05-14)

### 🔨 Refactoring

* remove default hreflang
 ([232d7c8](https://github.com/upstars-global/unity-core-modules/commit/232d7c8aa8b3a1d24b345757099777057a5d462a))



    done

## [1.22.0](https://github.com/upstars-global/unity-core-modules/compare/v1.21.1...v1.22.0) (2025-05-14)

### 🚀 Features

* **UN-1142:** added new endpoint for pwa events ([#159](https://github.com/upstars-global/unity-core-modules/issues/159))
 ([4749d88](https://github.com/upstars-global/unity-core-modules/commit/4749d88ee15c50f2c2a42ac2ad8049fe6695d6ef))



    * UN-1142: added new endpoint for pwa events

    * UN-1142: added check for logged user for pwa events

    * UN-1142: added check for logged user for pwa events

    * UN-1142: added logs

    * UN-1142: removed logs

## [1.21.1](https://github.com/upstars-global/unity-core-modules/compare/v1.21.0...v1.21.1) (2025-04-30)

### 🔨 Refactoring

* release config and add semantic-release docs ([#158](https://github.com/upstars-global/unity-core-modules/issues/158))
 ([b571504](https://github.com/upstars-global/unity-core-modules/commit/b571504fdbc862daf655d7b3dffb47b36cb71e0e))



    Updated `release.config.js` for consistent style and refined release rules, aligning with best practices. Added `semantic-release.md` to document commit message conventions for semantic release automation.

## [1.21.0](https://github.com/upstars-global/unity-core-modules/compare/v1.20.0...v1.21.0) (2025-04-28)

### 🧪 Testing

* UN-833 Add tests for gamesFavorite store and improve code form… ([#154](https://github.com/upstars-global/unity-core-modules/issues/154))
 ([83922a2](https://github.com/upstars-global/unity-core-modules/commit/83922a2035d6ffd8f1fa06ec32cbd040c5632630))



    * tests: UN-833 Add tests for gamesFavorite store and improve code formatting

    Implemented unit tests for gamesFavorite store to ensure functionality of main actions such as loading, adding, and deleting favorite games. Refactored and standardized header and code formatting for consistency.

    * Refactor favorite games API calls and optimize logic

    Replaced direct HTTP calls with dedicated functions (fetchFavoriteGames, fetchAddFavoriteGamesCount, fetchDeleteGameFromFavorites) for better reusability. Simplified and optimized the favorite games store logic. Introduced type safety for game versions with `AcceptsGamesVariants` and improved maintainability.

    * Refactor favorite games store and unit tests

    Replaced direct HTTP mocks with specific API request mocks for better modularity and readability. Streamlined data setup in tests and updated store logic for clarity and consistency. Improved error handling and removed redundant legacy code.

## [1.20.0](https://github.com/upstars-global/unity-core-modules/compare/v1.19.0...v1.20.0) (2025-04-25)

### 🧪 Testing

* UN-362: Add unit tests for environments store and fetch service ([#153](https://github.com/upstars-global/unity-core-modules/issues/153))
 ([f1c1035](https://github.com/upstars-global/unity-core-modules/commit/f1c1035e754e8f127e3e069d5a8aee890e50cd40))



    UN-362: Add unit tests for environments store and fetch service

    Introduce comprehensive tests for the `useEnvironments` store and `useEnvironmentsFetchService`, covering default values, computed properties, and service methods. These tests ensure correct initialization, environment handling, and proper functioning of store-related services.

## [1.19.0](https://github.com/upstars-global/unity-core-modules/compare/v1.18.0...v1.19.0) (2025-04-25)

### 🚀 Features

* **UN-920:** add groupIds property to IBannerConfig interface ([#155](https://github.com/upstars-global/unity-core-modules/issues/155))
 ([7f63c8b](https://github.com/upstars-global/unity-core-modules/commit/7f63c8b0dfc0b1bd67d390d8eeac27960728409d))

## [1.18.0](https://github.com/upstars-global/unity-core-modules/compare/v1.17.1...v1.18.0) (2025-04-23)

### 🔨 Refactoring

* remove deprecated autocomplete from useUIStore
 ([2e7e6b9](https://github.com/upstars-global/unity-core-modules/commit/2e7e6b9953a284c72acc3eca7413d96fd7e692dd))



    remove deprecated autocomplete from useUIStore

## [1.17.1](https://github.com/upstars-global/unity-core-modules/compare/v1.17.0...v1.17.1) (2025-04-22)

### 🐛 Bug Fixes

* UN-1111 fix checkHasAvailableCards ([#152](https://github.com/upstars-global/unity-core-modules/issues/152))
 ([89ee56c](https://github.com/upstars-global/unity-core-modules/commit/89ee56ceab06b138b9338cd8c0d4a055642695a5))

## [1.17.0](https://github.com/upstars-global/unity-core-modules/compare/v1.16.2...v1.17.0) (2025-04-16)

### 🚀 Features

* UN-921 add static page category ([#148](https://github.com/upstars-global/unity-core-modules/issues/148))
 ([7b60456](https://github.com/upstars-global/unity-core-modules/commit/7b6045625c94107c40bd2564cbb9e69ef3883774))

## [1.16.2](https://github.com/upstars-global/unity-core-modules/compare/v1.16.1...v1.16.2) (2025-04-15)

### 🐛 Bug Fixes

* UN-1080 import log ([#147](https://github.com/upstars-global/unity-core-modules/issues/147))
 ([9b609e5](https://github.com/upstars-global/unity-core-modules/commit/9b609e5358c291061cb007799103c110218fa3e7))

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
