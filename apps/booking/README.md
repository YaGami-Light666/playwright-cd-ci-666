# CAMT Study Room Booking

A tiny vanilla-JS single-page app used as the reference application for the
495 Automated Test course (Week 10, Lab 2 — Locators, Interactions & Web-First
Assertions). It lets a student view study rooms, book one, view "My bookings"
and cancel a booking.

## Run it

```
npm start
```

Serves on `http://localhost:4173` (override with the `PORT` environment
variable). No dependencies, no build step — a plain Node `http` server hands
out the static files in this folder.

## Routes (hash routing)

- `#/rooms` — Rooms list
- `#/book/<roomId>` — Booking form (`room-a`, `room-b`, `room-c`, `room-d`, `quiet-pod-1`)
- `#/confirmed/<reference>` — Booking confirmed
- `#/my-bookings` — My bookings

An empty hash redirects to `#/rooms`.

## Test hook

Open the app with `?service=down` in the query string (e.g.
`http://localhost:4173/?service=down#/rooms`) to make every attempt to save a
booking fail, simulating the booking service being unavailable.

## State

All data lives in memory and is re-seeded every time the page is loaded or
reloaded — there is no backend and no persistence.
