# CivicAI backend AI analysis

CivicAI stores every citizen report in SQLite before scheduling advisory AI analysis. The browser never calls the AI provider and no `VITE_*` AI secret is used. A failed or unavailable provider changes only the analysis status; it does not roll back or delete the report.

## Provider setup

Copy `.env.example` to `.env` and configure `AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`. The adapter supports OpenAI and OpenAI-compatible Chat Completions endpoints with strict JSON-schema response formatting. `AI_TIMEOUT_MS` bounds each request and `AI_MAX_RETRIES` controls exponential-backoff retries for transient failures and malformed structured output. Permanent configuration/authentication failures are not retried. No real secret belongs in Git or `.env.example`.

Optional image assistance is disabled by default. Set `AI_ENABLE_IMAGE_ANALYSIS=true` only when the configured model accepts images. The backend then sends at most three JPEG/PNG/WebP citizen-evidence images, each no larger than 4 MB. Text analysis continues when this is false.

## External data and privacy

Only title, original citizen description, citizen-selected category, civic address, ward, municipality, province, coordinates, and bounded deterministic duplicate-candidate metadata are sent. Eligible citizen images are sent only when explicitly enabled. Account names, email addresses, passwords, sessions, tokens, notes, authority data, and admin data are never included. Full descriptions are not written to AI operational logs.

## Validation and prompt safety

The provider must return controlled category, priority, severity, department, confidence (0–1), concise summary, concise user-facing rationale, safety risk, immediate-attention flag, duplicate keywords, tags, detected language, authenticity risk assessment, and suspicion indicators. Runtime validation rejects unknown keys/enums, invalid types, out-of-range confidence, excessive text/arrays, and inconsistent high-risk flags. Malformed output is never persisted as complete.

Citizen input is delimited as untrusted `REPORT_DATA`. The system prompt forbids following instructions embedded in citizen text and requests no hidden chain-of-thought. English, Nepali, Romanized Nepali, and mixed language are supported without changing the stored original text.

## Lifecycle, authorization, and audit

Statuses are `pending`, `processing`, `complete`, and `failed`. Every run creates a versioned `report_ai_analyses` record with provider, model, timestamps, attempts, safe failure code, and initiator. Server restart recovery requeues pending/processing work.

Only administrators can call `POST /api/reports/:id/ai/retry`, and it is rate-limited. Citizens can view only their reports; authorities only department/assigned reports. `GET /api/reports/:id/analysis` enforces the same policy. Provider details and failure codes are staff-only; raw errors are not exposed.

AI output is advisory, never official verification. Deterministic duplicate matching uses category, unresolved age, distance, and token overlap; duplicates remain stored. Suspicion never rejects a report. Admin category/priority/department overrides record actor, prior/new value, reason, and time while preserving AI history.

Safe failure codes are `AI_PROVIDER_UNAVAILABLE`, `AI_TIMEOUT`, `AI_RATE_LIMITED`, `AI_INVALID_RESPONSE`, `AI_CONFIGURATION_ERROR`, and `AI_ANALYSIS_FAILED`.

Run `npm test`, `npm run lint`, and `npm run build`. Provider tests use a controlled HTTP stub; a live provider call requires a valid deployment secret and compatible configured model.
