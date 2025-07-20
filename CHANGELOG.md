# v3.2.0 (Sat Jul 20 2025)

## 🚨 BREAKING CHANGES

⚠️ **Security Update**: This release contains critical security fixes that require breaking changes.

#### 💥 Breaking Changes

- **html.minifyHtml()**: Function is now async and returns `Promise<string>` instead of `string`
  - **Before**: `const result = minifyHtml(html, options);`
  - **After**: `const result = await minifyHtml(html, options);`
- **Replaced vulnerable html-minifier@4.0.0** with secure html-minifier-terser@7.2.0
- **Replaced vulnerable lodash.template@4.5.0** with secure custom template implementation

#### 🔒 Security Fixes

- **CRITICAL**: Fixed REDoS vulnerability in html-minifier (GHSA-pfq8-rq6v-vf5m)
- **CRITICAL**: Fixed command injection vulnerability in lodash.template (GHSA-35jh-r3h4-6jhm)
- **MODERATE**: Fixed multiple ReDoS vulnerabilities in @octokit dependencies via overrides
- **LOW**: Fixed brace-expansion ReDoS vulnerability

#### 🛡️ Security Improvements  

- Implemented secure template processing with input validation
- Added protection against code injection in template processing
- Updated all vulnerable dependencies to secure versions
- Zero known vulnerabilities remaining

#### 📋 Migration Guide

If you use the `minifyHtml` function, update your code to handle the async return:

```typescript
// Before
import { minifyHtml } from '@tylertech/forge-build-tools';
const minified = minifyHtml(htmlContent, options);

// After  
import { minifyHtml } from '@tylertech/forge-build-tools';
const minified = await minifyHtml(htmlContent, options);
```

#### Authors: 1

- Security Audit & Remediation Team

---

# v3.1.1 (Fri May 23 2025)

#### 🐛 Bug Fix

- chore: update dependencies [#9](https://github.com/tyler-technologies-oss/forge-build-tools/pull/9) ([@DRiFTy17](https://github.com/DRiFTy17))

#### Authors: 1

- Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17))

---

# v3.1.0 (Fri Jul 19 2024)

#### 🚀 Enhancement

- feat(sass): use `compile` API and expose sass options [#8](https://github.com/tyler-technologies-oss/forge-build-tools/pull/8) ([@DRiFTy17](https://github.com/DRiFTy17))

#### Authors: 1

- Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17))

---

# v3.0.1 (Fri Jul 12 2024)

#### 🐛 Bug Fix

- fix(sass): ensure file paths are normalized to support both *nix and windows [#7](https://github.com/tyler-technologies-oss/forge-build-tools/pull/7) ([@DRiFTy17](https://github.com/DRiFTy17))

#### ⚠️ Pushed to `main`

- chore: husky update ([@DRiFTy17](https://github.com/DRiFTy17))

#### Authors: 1

- Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17))

---

# v3.0.0 (Tue Jun 11 2024)

#### 💥 Breaking Change

- feat: initial 3.0 GA release [#6](https://github.com/tyler-technologies-oss/forge-build-tools/pull/6) ([@DRiFTy17](https://github.com/DRiFTy17))

#### 🚀 Enhancement

- feat: release ([@DRiFTy17](https://github.com/DRiFTy17))

#### 🐛 Bug Fix

- fix: upgrade Auto [#4](https://github.com/tyler-technologies-oss/forge-build-tools/pull/4) ([@DRiFTy17](https://github.com/DRiFTy17))

#### ⚠️ Pushed to `main`

- chore: allow for manually dispatching release workflow ([@DRiFTy17](https://github.com/DRiFTy17))

#### Authors: 1

- Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17))

---

# v2.1.0 (Tue Sep 05 2023)

#### 🚀 Enhancement

- feat(typescript): add build support for es2020+ [#3](https://github.com/tyler-technologies-oss/forge-build-tools/pull/3) ([@DRiFTy17](https://github.com/DRiFTy17))

#### 🐛 Bug Fix

- chore: update workflows [#2](https://github.com/tyler-technologies-oss/forge-build-tools/pull/2) ([@DRiFTy17](https://github.com/DRiFTy17))

#### ⚠️ Pushed to `main`

- chore: upgrade workflow ([@DRiFTy17](https://github.com/DRiFTy17))

#### Authors: 1

- Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17))

---

# v2.0.0 (Fri Jun 24 2022)

:tada: This release contains work from a new contributor! :tada:

Thank you, Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17)), for all your work!

#### 🚀 Enhancement

- feat: oss prep [#1](https://github.com/tyler-technologies-oss/forge-build-tools/pull/1) ([@DRiFTy17](https://github.com/DRiFTy17))

#### ⚠️ Pushed to `main`

- chore: update workflows ([@DRiFTy17](https://github.com/DRiFTy17))
- chore: upgrade `stylelint` to fix deprecation warning ([@DRiFTy17](https://github.com/DRiFTy17))
- chore: adding CODEOWNERS ([@DRiFTy17](https://github.com/DRiFTy17))
- initial commit ([@DRiFTy17](https://github.com/DRiFTy17))

#### Authors: 1

- Kieran Nichols ([@DRiFTy17](https://github.com/DRiFTy17))
