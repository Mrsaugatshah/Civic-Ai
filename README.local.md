# CivicAI

## Run locally

Install dependencies once in both packages:

```bash
npm install
npm --prefix server install
```

Create the local SQLite database and seed the demo accounts:

```bash
cp .env.example .env
npm run db:setup
```

Each clone creates its own `server/civicai.sqlite` database. Database files,
SQLite lock files, uploaded evidence, and `.env` secrets are intentionally not
committed to Git. The server also creates the schema automatically if
`db:setup` was not run first.

Then start the complete app from the project root:

```bash
npm run dev
```

This launches both the CivicAI web app and its authentication API. The seeded
demo accounts use the password `Civic@123`:

- Citizen: `asha@city.gov`
- Authority: `ward11@city.gov`
- Admin: `admin@city.gov`

To send real verification codes, replace the SMTP placeholders in `.env` with
credentials from your email provider. Keep `EMAIL_VERIFICATION_REQUIRED=false`
only for local development when SMTP is not available.

For a production-style local run:

```bash
npm run build
npm start
```

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
