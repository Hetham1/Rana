# Deployment runbook

## Pre-deployment

1. Run API tests, all client lint tasks, all production builds, and runtime dependency audits.
2. Back up PostgreSQL and confirm the backup can be listed with `pg_restore --list`.
3. Verify production secrets are supplied by the deployment platform, not an image or repository file.
4. Review migrations for locks, table rewrites, and backward compatibility.
5. Build immutable artifacts and record their version or image digest.

## Release sequence

1. Apply backward-compatible migrations with one controlled migration job.
2. Deploy the API with a rolling strategy and wait for `/ready` on each instance.
3. Deploy versioned static client assets through the CDN or web server.
4. Smoke-test login for each role, a report, an inventory lookup, and the security order lookup.
5. Monitor 4xx/5xx rate, PostgreSQL connection saturation, query latency, and login throttling.

Do not run migrations automatically from every API replica: simultaneous schema jobs can conflict even though PostgreSQL uses locks. Mature systems use one release job with a deployment advisory lock.

## Network and TLS

Terminate HTTPS at a reverse proxy, ingress, or cloud load balancer. Forward traffic to the API over a private network, set conservative upstream timeouts, and preserve a request identifier for tracing. Camera clients must be served over HTTPS.

Restrict PostgreSQL network access to the API workload. Use a dedicated application role with only the required schema privileges. Rotate database credentials and JWT signing secrets through a managed secret store.

## Rollback

If health checks or smoke tests fail, stop the rollout and redeploy the prior immutable artifact. Do not reverse an applied migration by editing its file. Use a reviewed compensating migration when data is intact; restore the pre-release backup when the migration caused destructive corruption. Record the incident timeline and affected transaction IDs from `inventory_movements` and structured logs.

## Capacity checks

Before production launch, define service-level objectives (SLOs), for example p95 API latency below 300 ms and error rate below 1% at the expected concurrency. Use k6 or Locust for load tests, with a staging dataset and explicit targets. PostgreSQL pool size is 20 per API instance; total possible connections are `replica count × pool size`, which must stay below the database limit with headroom for migrations and administration.
