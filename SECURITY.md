# Security policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting for this repository when available, or contact the repository maintainers privately through their GitHub profiles. Include affected versions, reproduction steps, impact, and any suggested mitigation. Do not include real credentials or personal data.

Maintainers should acknowledge a report promptly, reproduce it in an isolated environment, coordinate a fix and disclosure timeline, and credit the reporter when requested. No fixed response-time guarantee is currently offered.

## Supported versions

Until tagged stable releases exist, security fixes are applied to the latest `main` branch only. Deployers are responsible for tracking updates, rotating secrets, backing up PostgreSQL, and validating their infrastructure configuration.

## Deployment responsibilities

- Replace all development credentials and use a secret manager.
- Serve every public application and the API through HTTPS.
- Restrict PostgreSQL network access to the API and use least-privilege roles.
- Keep Node.js, PostgreSQL, reverse proxies, and container images patched.
- Monitor authentication failures, HTTP 5xx responses, database saturation, and unexpected inventory movements.
- Rotate the historical certificate/private key before any production use.
