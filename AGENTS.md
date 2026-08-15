# AGENTS.md

## Project

JobPilot — a Tauri 2 desktop app for AI-assisted job hunting (parse offers, generate tailored CVs/cover letters, technical tests, ATS analysis).

- `src/` — Angular 20 frontend (standalone components, no NgModules)
- `src-tauri/` — Rust backend (Tauri commands, AI client, SQLite migrations)
- Package manager is **Bun** (only `bun.lock` exists — no npm/pnpm/yarn lockfile). Use `bun install`, not `npm install`.

## Commands

- `bun run tauri dev` — full dev: starts Angular dev server (`bun run start`) then launches the Tauri window.
- `bun run tauri build` — production desktop build.
- `bun run start` — Angular dev server only, on port **1420** (not the default 4200).
- `bun run build` — Angular production build → `dist/jobpilot/browser` (path hardcoded in `src-tauri/tauri.conf.json`).
- `cargo test` (run inside `src-tauri/`) — the only real test suite (unit tests in `src-tauri/src/commands.rs`).
- No lint/format scripts are configured in `package.json`.

## Architecture

- Frontend ↔ backend communication is via Tauri `invoke` → Rust `#[tauri::command]`. TS side lives in `src/app/core/ai.service.ts` and `db.service.ts`; Rust side in `src-tauri/src/commands.rs`.
- **All AI calls go through the Rust backend** (OpenAI-compatible client in `src-tauri/src/ai/openai_compatible.rs`; `reqwest` with rustls). Default provider is OpenRouter; provider list is in `src/app/core/models.ts` (`AI_PROVIDERS` / `baseUrlForProvider`).
- Adding an AI feature: add a `#[tauri::command]` in `commands.rs` → register it in `src-tauri/src/lib.rs` `invoke_handler` → add a wrapper method in `ai.service.ts`.
- `commands.rs` uses `ask_json` + `parse_json_lenient`: retries up to 3× and tolerates markdown fences/corrupted prefixes when the model returns non-JSON. Reuse these for new commands.
- Data: SQLite via `tauri-plugin-sql`, DB URL `sqlite:jobpilot.db`. Migrations live in `src-tauri/src/db.rs` — **append a new `Migration` version, never edit an existing one**. The DB is also opened from TS (`DbService` → `Database.load("sqlite:jobpilot.db")`).
- Settings (`provider`, `base_url`, `api_key`, `model`, `theme`) are persisted in the `settings` SQLite table (API key stored plaintext). Frontend state is a signal in `SettingsService`.
- Routes are lazy-loaded via `loadComponent` in `src/app/app.routes.ts`. Component selector prefix is `app`.

## Conventions & gotchas

- UI and error strings are **Spanish** (offer statuses are `guardada` / `aplicada` / `entrevista` / `oferta` / `rechazada`). Keep new user-facing text in Spanish.
- `src/app/core/roboto-bold.ts` is a huge base64 font blob — do not format or hand-edit it.
- `pdfmake` is used for PDF generation (`src/app/core/pdf.service.ts`); it adds Roboto-Bold via that base64 blob. PDFs are written to disk through the `save_file` command.
- Angular `strict` and `strictTemplates` are enabled — templates are type-checked.
- UI icons use the `NerdFontSymbols` font (`src/assets/fonts/SymbolsNerdFont-Regular.ttf`, defined in `src/styles.css`).
