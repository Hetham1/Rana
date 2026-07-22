# Contributing

Thank you for improving Etemad Rana. Keep changes focused, explain their operational impact, and avoid mixing refactors with unrelated behavior changes.

## Development workflow

1. Fork the repository and create a short-lived branch from `main`.
2. Run `npm ci` from the repository root.
3. Copy only the `.env.example` files needed for your work; never commit secrets.
4. Apply migrations with `npm run db:migrate` and load development fixtures with `npm run db:seed`.
5. Make a focused change and run `npm run check` before opening a pull request.

Use Conventional Commit subjects such as `feat(admin): add request filters`, `fix(api): validate transport state`, or `docs: explain backup recovery`. Code comments should explain business constraints and non-obvious decisions, not restate the syntax.

## Database changes

Applied migration files are immutable. Add the next numbered SQL migration and make it backward compatible with the currently deployed application whenever possible. For destructive changes, use expand/migrate/contract: introduce the new shape, deploy compatible code, migrate data, and remove the old shape in a later release.

Seed files must be idempotent and development-safe. Never add real customer, employee, credential, or production inventory data.

## Testing expectations

- Unit tests must be deterministic and mock external systems.
- API behavior changes should include route or service tests.
- Scanner and authorization changes should include a documented manual check until automated browser coverage exists.
- Performance-sensitive changes should state the expected concurrency and latency target.

## Pull requests

Describe what changed, why it changed, how it was tested, any migration or rollback requirements, and screenshots for visible UI changes. Keep generated outputs, `node_modules`, local environment files, certificates, database dumps, and editor settings out of commits.

By contributing, you agree that your contribution is licensed under AGPL-3.0-or-later.
