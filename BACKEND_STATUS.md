# Backend status

CivicAI uses its Express backend for bcrypt password authentication, role-aware authorization, hashed server-side sessions in `HttpOnly` cookies, real SMTP email verification, and password recovery. Production setup and limitations are documented in [AUTH_PRODUCTION.md](./AUTH_PRODUCTION.md).

The reports data and other hackathon modules retain their existing architecture; this authentication upgrade does not replace or duplicate them.
