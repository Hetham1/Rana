# Management application

The management client provides live PostgreSQL analytics, inventory and production reports, and request approvals in a responsive Persian RTL interface.

Run it from the repository root with `npm run dev:admin`. Configuration is read from `apps/admin/.env`; copy `.env.example` and keep `VITE_API_URL` pointed at the versioned `/api/v1` endpoint.

Dashboard aggregates come from `GET /adminreport/analytics`. Wide operational reports use the shared data-table component for search, pagination, sticky headers, and bounded scrolling.
