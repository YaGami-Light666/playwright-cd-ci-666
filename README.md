# Lab 11 — combined Labs 08 and 09 suite

This project brings the completed Playwright tests from both earlier labs into one runnable suite.

- `tests/lab08/saucedemo` — locator and interaction tests for SauceDemo
- `tests/lab08/booking` — study-room booking tests and their application in `apps/booking`
- `tests/lab09/saucedemo` — SauceDemo page-object and fixture tests
- `tests/lab09/helpdesk` — Help Desk page-object and fixture tests, with its Vue app in `apps/helpdesk`

## Run

```bash
npm install
npm run install:browsers  # only needed once per computer
npm test                  # all four suites in Chromium, Firefox, and WebKit
```

For a faster local check, run the Chromium versions only:

```bash
npm run test:chromium
```

Playwright automatically starts the two local applications on ports 4173 and 4174. The three deliberately broken Lab 09 diagnostic examples remain under `tests/lab09/saucedemo/tests/broken`, but are excluded from the normal run.
