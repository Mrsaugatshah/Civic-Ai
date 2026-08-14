# CivicAI production authentication

## Configuration

Copy `.env.example` to `.env` and replace every email placeholder with credentials from a transactional SMTP provider. `FRONTEND_URL` must be the exact public frontend origin (no path). Never commit `.env`.

For port 587 use `EMAIL_SECURE=false` with TLS required. For port 465 use `EMAIL_SECURE=true`. In production, set `NODE_ENV=production` so the session cookie is `Secure`; serve the application only through HTTPS. Set `TRUST_PROXY=true` only when Express is directly behind a trusted reverse proxy.

## Data model and deployment

The existing `server/db.json` store is retained. Authentication records use `emailVerificationTokens`, `passwordResetTokens`, and `sessions`; all contain SHA-256 token hashes, never raw bearer values. Writes use an atomic temporary-file rename, and related mutations use rollback snapshots.

This is safe for one Node server process. Do not run multiple server replicas against the same JSON file. A multi-instance production deployment must migrate the same model to PostgreSQL or another transactional database and use a shared session/rate-limit store.

## Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
NODE_ENV=production npm start
```

Tests:

```bash
npm --prefix server test
npm run lint
npm run build
```

The automated email tests use an in-memory Nodemailer transport and never expose tokens through an HTTP endpoint. A final live-provider check requires real credentials: register with an inbox you control, follow the received verification link, then request and follow a password-reset email.
