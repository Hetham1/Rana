# Security application

The security client handles gate-entry requests, dispatch review, QR validation, and driver/transport registration. Authorization is enforced by the API rather than by client-side navigation.

Run it from the repository root with `npm run dev:security`. Camera access requires HTTPS except on `localhost`; configure the API through `apps/security/.env` using the supplied example.
