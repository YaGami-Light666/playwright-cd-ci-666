# CAMT Help Desk — system under test

Vue 3 + Vite + TypeScript single-page application for 495 Automated Test, week 11
lab 2. No backend, no persistence: all state lives in `src/store.ts` and is
re-seeded on every page load, so tests are independent and can run in parallel.

```bash
npm install
npm run dev         # http://localhost:4174
npm run type-check  # vue-tsc, also runs as part of npm run build
```

Sign in as `agent` / `camt1234`. The full specification — flows, business rules,
seed data, test hooks and the UI reference table — is in `../USE-CASE.md`.

Playwright starts this server itself (`webServer` in both lab projects), so you
only need `npm run dev` to look at the app by hand.

## Source map

| File | What it is |
|---|---|
| `src/store.ts` | domain types (`Ticket`, `Agent`, `Result`), all state and all business rules (BR-1 assignment limit, BR-2 note length), plus the `?service=down` hook |
| `src/router.ts` | hash routes and the guard that sends anonymous visitors to `#/login` |
| `src/views/LoginView.vue` | UC-01 |
| `src/views/QueueView.vue` | the ticket queue, filters and search |
| `src/views/TicketDetailView.vue` | UC-02 / UC-03 / UC-04, including the 400 ms assignment round trip |
| `src/views/MyTicketsView.vue` | the agent's own tickets |
| `src/components/TopNav.vue` | header shared by every signed-in screen |
| `src/components/TicketRow.vue` | one row — rendered on the queue **and** on My tickets |
| `src/components/ResolveDialog.vue` | native `<dialog>` opened with `showModal()` |
| `tsconfig.json` / `src/env.d.ts` | strict TypeScript config and the Vite client types |

Every component uses `<script setup lang="ts">`; props and emits are declared
with type-only signatures (`defineProps<{ ticket: Ticket }>()`).

Deliberate design choices for teaching are listed in `../README.md`.
