# PostgreSQL data model

The schema was inferred from every SQL statement in the legacy API and every field consumed by the clients. The source of truth is `services/api/migrations/001_initial_schema.sql`; `002_seed_development.sql` provides login identities and `003_seed_mock_data.sql` provides the idempotent high-volume demonstration dataset.

## Entity mapping

| Legacy MySQL name | PostgreSQL name | Purpose |
| --- | --- | --- |
| `user` | `users` | Identity, role, password hash, and assigned workplace |
| `workplace` | `workplaces` | Warehouse, production, and security locations |
| `wireSpool` | `wire_spools` | Conductive material inventory |
| `insul` | `insulation_batches` | Insulation inventory by batch |
| `cart` | `carts` | Produced cart/basket inventory |
| `finalproduct` | `final_products` | Dispatchable final goods |
| `productionplan` | `production_plans` | Production measurements and output metadata |
| Concatenated `wspId`/`insId` strings | `production_plan_materials` | Normalized material assignments |
| `order` | `orders` | Customer order lifecycle |
| `contain` | `order_items` | Product quantity per order |
| `sold_finalproduct` | `sold_final_products` | Physical final goods allocated to an order |
| `request` | `requests` | User-to-user operational approvals |
| `transports` | `transports` | Driver and dispatch record |
| None | `inventory_movements` | Immutable operational audit trail |

## Important constraints

- Inventory IDs retain `wsp`, `ins`, `car`, and `fip` prefixes because scanners use them as type discriminators.
- Foreign keys prevent references to nonexistent users, workplaces, products, and orders.
- Request status is one of `pending`, `approved`, or `denied`; sender and receiver cannot be the same user.
- A production material row points to exactly one wire spool or insulation batch using `num_nonnulls`.
- Transport creation and order exit happen in one transaction.
- Indexed workplace/state, order status/date, request ownership/status, and audit fields support the current query patterns.

## Migration policy

Schema migration filenames are ordered and recorded in `schema_migrations`. Applied files are immutable. Add schema changes as the next numbered non-seed migration; seed files match `*_seed_*.sql` and may be rerun because they are deliberately idempotent.

For a real MySQL import, write a separate extraction/transform/load job. Convert legacy `reqOk` values (`1`, `0`, `pending`) to the PostgreSQL status values, parse concatenated production material identifiers into link-table rows, and verify row counts plus orphan counts before cutover.

## Backup example

```bash
pg_dump --format=custom --file=rana-before-deploy.dump --dbname="$DATABASE_URL"
```

This creates a compressed, restorable logical backup. Keep the URL in an environment variable so credentials are not written into shell history. For large databases, physical backups plus WAL archiving restore faster; they require more operational setup and version compatibility.
