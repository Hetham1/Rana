# API compatibility reference

All application routes use the `/api/v1` prefix. Protected routes accept the standard `Authorization: Bearer <token>` header. Legacy raw tokens remain accepted during migration.

## Route groups

| Group | Allowed roles | Routes |
| --- | --- | --- |
| Authentication | Public or any signed-in user | `POST /login`, `POST /logout`, `GET /protected` |
| Inventory movement | `admin`, `operator`, `security` | `PUT /entry/:uid`, `PUT /exit/:uid`, `GET /uidDetails/:uid` |
| Inventory management | `admin`, `operator` | `PUT /placement/:uid`, `GET /report/query`, `PUT /pp/assign/:ppId` |
| Catalog | Any signed-in user | `GET /prod/name`, `GET /workplace*`, `GET /pp`, `GET /manf/name`, `GET /prod/highdemand`, `GET /users` |
| Requests | Any signed-in user; `/adminrequest/*` requires `admin` | `GET/PUT /request`, `POST /request/new`, `GET /secrequest`, and `/adminrequest/*` approval routes |
| Order gathering | `admin`, `operator` | `GET /order` and order gathering actions |
| Shared order details | `admin`, `operator`, `security` | `GET /orderDetails/:orderId` |
| Security and dispatch | `admin`, `security` | `GET /gatheredexit`, `GET /fporder/:orderId`, `GET/PUT /ordersc/:orderId`, `POST /transports/new` |
| Management reporting | `admin`, `analyst` | `/adminreport`, `/adminreport/default`, `/adminreport/pp*`, KPI counters, latest orders, `GET /adminreport/summary`, and `GET /adminreport/analytics` |

Successful responses preserve the established envelope:

```json
{ "success": true, "data": [] }
```

Expected client failures use:

```json
{ "success": false, "error": "client-safe message", "details": {} }
```

Validation failures return HTTP 400, missing/expired authentication returns 401, an authenticated role without permission returns 403, missing resources return 404, and valid requests that conflict with current business state return 409. Unexpected database/internal errors return a generic 500 message while full details remain in redacted structured server logs.

Legacy camel-case fields such as `wspId`, `reqReciever`, and `cartLenght` are intentionally returned as aliases. Correct spellings are used inside PostgreSQL; removing aliases requires a versioned client migration.
