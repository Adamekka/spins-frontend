# Frontend Implementation Plan

## Scope

Build a Svelte/Vite single-page frontend for the Spins backend described in `../spins-backend/SPEC.md`.

## Success Criteria

- App loads seed player and paytable data from `http://localhost:8080/api`.
- User can run a base spin with a selected bet and see balance, total win, tumbles, multipliers, and free-spin trigger state.
- User can buy free spins and consume triggered/purchased free-spin sessions through `POST /api/spin/free`.
- User can view recent spin history and replay a spin detail through `GET /api/spin/{id}`.
- Backend error responses are shown clearly without crashing the UI.
- Layout is usable on desktop and mobile.
- `bun run build` succeeds.

## Steps

- [x] Implement API types, fetch handling, initial loading, errors, and player/paytable/history state.
- [x] Implement spin, buy-free-spins, free-spin, reset, refresh-history, and replay flows.
- [x] Render the 6x5 symbol grid, tumble progression, result metrics, session status, controls, history, and paytable summary.
- [x] Add responsive styling and symbol presentation.
- [x] Run `bun run build` and address any compiler/build issues.

## Verification

- [x] Build passes locally.
- [x] Manual code review confirms request/response shapes match backend DTOs and SPEC.md.

## Progress Notes

- Refactor plan: keep behavior unchanged, move API/types/formatting/symbol/tumble logic into `src/lib`, split UI sections into Svelte components, and leave `App.svelte` responsible for state orchestration and game flow.
- Backend API checked against source; endpoints match SPEC.md. Additional possible error: `PLAYER_NOT_FOUND`.
- Implemented the frontend in `src/App.svelte` with backend API integration, free-spin session state, tumble playback, reset, history, and replay.
- Added responsive slot-machine styling in `src/app.css`.
- Review pass found and fixed active free-spin session recovery after refresh/replay, stale grid display after buying free spins, and small-screen grid overflow risk.
- Reset bug diagnosis: frontend did not clear local bonus state, and backend reset only restored balance, leaving persisted free-spin sessions active. Updated frontend reset state and backend reset semantics.
- Added local SVG slot symbols under `public/symbols` and updated grid/paytable rendering to use them.
- Restyled the UI as a slot machine cabinet with marquee lights, framed reels, glass treatment, and plunger-style primary buttons.
- Added keyed tumble grid rendering and staggered symbol fall animation for each spin/tumble.
- Refined tumble rendering to infer stable symbol identities between grid snapshots, so unchanged symbols stay still, moved symbols use FLIP movement, and only new refills drop in.
- Fixed cabinet decoration bleeding through result/tumble UI by removing the full-card light texture and making stat panels opaque.
- Rewrote visible UI/status/error copy to avoid implementation terms and raw backend error messages.
- Added triggered-symbol detection and pulse/glow animation for winning symbols, free-spin scatters, and final multipliers on winning spins.
- Refactored frontend code into shared `src/lib` modules and focused UI components, leaving `App.svelte` responsible for orchestration.

## Results

- `bun run build` passes after implementation and after review fixes.
- `bun run build` passes after asset/cabinet styling.
- `bun run build` passes after fall animation.
- `bun run build` passes after selective tumble animation.
- `bun run build` passes after readability fix.
- `bun run build` passes after user-facing copy rewrite.
- `bun run build` passes after triggered-symbol animation.
- `bun run build` passes after component/module refactor.
- Focused review pass found no actionable refactor regressions; browser click-through against a live game remains the manual verification gap.
- `mvn test` passes in `../spins-backend` after the reset/session backend fix.
