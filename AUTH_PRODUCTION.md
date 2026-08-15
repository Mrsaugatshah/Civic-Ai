# Production authentication

## Setup

1. Copy `.env.example` to `.env` and add real SMTP credentials.
2. Set `FRONTEND_URL` to the public frontend origin, without a path.
3. Use `EMAIL_SECURE=false` with required TLS on port 587, or `true` on port 465.
4. In production, use HTTPS and `NODE_ENV=production`. Set `TRUST_PROXY=true` only behind a trusted reverse proxy.

Never commit `.env`, SQLite files, WAL/SHM files, or uploaded evidence.

## Run

```bash
npm install
npm run db:setup
npm run build
NODE_ENV=production npm start
```

The database is also initialized automatically when the server starts. Use a proper SQLite backup when moving production data; do not copy a live database. Run only one server instance with SQLite. Multiple instances require a shared production database and shared rate-limit storage.

## Verify

```bash
npm --prefix server test
npm run lint
npm run build
```

Finally, register with a real inbox, verify the six-digit email code, and test the password-reset link.
