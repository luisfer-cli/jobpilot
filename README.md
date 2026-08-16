# JobPilot

A Tauri 2 desktop app for AI-assisted job hunting. Parse job offers, generate tailored CVs and cover letters, practice with technical tests, and analyze your ATS fit — all from a single window.

## Features

- **Job offer parser** — paste an offer and extract structured data (title, requirements, responsibilities, skills, salary, etc.) with AI.
- **Tailored CVs** — rewrite your base CV to target a specific offer, reordering and emphasizing the most relevant experience. Export to PDF.
- **Cover letters** — generate a personalized cover letter from your profile and a job offer.
- **Technical tests** — create practice tests from an offer or any topic, with single/multiple choice, true/false, short answer, and coding questions. Answers are evaluated by AI.
- **ATS analysis** — score your profile against an offer with matched/missing keywords and concrete suggestions.
- **Offer tracking** — store offers with statuses (`guardada` / `aplicada` / `entrevista` / `oferta` / `rechazada`) and notes.
- **Multiple AI providers** — OpenRouter, OpenAI, Groq, Together AI, Mistral, DeepSeek, Perplexity, or any OpenAI-compatible custom endpoint.

## Tech stack

- **Frontend**: Angular 20 (standalone components, no NgModules)
- **Backend**: Rust + Tauri 2 (commands, AI client, SQLite migrations)
- **Data**: SQLite via `tauri-plugin-sql`
- **PDF generation**: `pdfmake`
- **Package manager**: Bun

## Prerequisites

- [Bun](https://bun.sh)
- [Rust](https://www.rust-lang.org/tools/install)
- Tauri system dependencies (see the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

## Getting started

```bash
bun install
bun run tauri dev
```

## Commands

| Command                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `bun run tauri dev`    | Full dev: starts Angular (port 1420) and Tauri       |
| `bun run tauri build`  | Production desktop build                             |
| `bun run start`        | Angular dev server only, on port 1420                |
| `bun run build`        | Angular production build                             |
| `cargo test`           | Rust unit tests (run inside `src-tauri/`)            |

## Architecture

- Frontend ↔ backend communication goes through Tauri `invoke` → Rust `#[tauri::command]`. The TS side lives in `src/app/core/ai.service.ts` and `db.service.ts`; the Rust side in `src-tauri/src/commands.rs`.
- All AI calls go through the Rust backend (`src-tauri/src/ai/openai_compatible.rs`, `reqwest` with rustls) to any OpenAI-compatible API.
- AI responses are requested as JSON with retries and lenient parsing (tolerates markdown fences and corrupted prefixes).
- Data is stored in SQLite (`sqlite:jobpilot.db`). Migrations live in `src-tauri/src/db.rs` — append a new `Migration` version, never edit an existing one.
- Settings (provider, base URL, API key, model, theme) persist in the `settings` SQLite table.

## Project structure

```
src/                 Angular frontend
  app/core/          Services, models, PDF generation
  app/pages/         Lazy-loaded routes (dashboard, cv, offers, tests, settings)
  app/components/    Reusable UI components
src-tauri/           Rust backend
  src/commands.rs    Tauri commands (AI features)
  src/ai/            OpenAI-compatible client
  src/db.rs          SQLite migrations
  icons/             App icons
```
