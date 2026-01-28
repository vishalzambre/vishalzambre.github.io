---
layout: post
section-type: post
title: "PostgreSQL Vacuum for Large Rails Tables"
category: postgresql
tags: [ 'postgresql', 'rails', 'vacuum', 'autovacuum', 'performance' ]
comments: true
---

PostgreSQL does not overwrite rows in place. Every UPDATE/DELETE creates dead
tuples that must be cleaned up. `VACUUM` is the mechanism that reclaims space,
keeps visibility maps current, and prevents transaction ID wraparound. When
tables grow large in Rails apps, vacuum strategy becomes critical for stability
and performance.

## Why vacuum matters in large Rails tables

Large tables (events, logs, audit, payments) tend to:

- accumulate dead tuples quickly due to frequent updates
- cause bloated indexes that slow down reads and writes
- increase I/O for sequential scans
- threaten transaction ID wraparound if left unchecked

Autovacuum usually handles this, but defaults are conservative. For very large
tables, you often need targeted tuning and occasional manual vacuum.

## Vacuum types in short

- `VACUUM`: marks dead tuples as reusable and updates stats. Does not rewrite
  the table. Safe to run online.
- `VACUUM (ANALYZE)`: also updates planner statistics immediately.
- `VACUUM FULL`: rewrites the table to reclaim space to the OS. Requires
  exclusive lock. Use rarely and during a maintenance window.

## Rails-friendly approach for large tables

### 1. Tune autovacuum per table

For large, high-churn tables, set a lower threshold and scale factor so
autovacuum runs more often on those tables only.

```sql
ALTER TABLE public.events SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 5000,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_analyze_threshold = 5000
);
```

Tip: lower scale factor, higher threshold is a common pattern. Adjust based on
row churn and available I/O.

### 2. Use manual VACUUM (ANALYZE) during off-peak

Schedule manual vacuum for the biggest tables if you see bloat or stale stats.
This keeps the planner healthy and helps index usage.

```sql
VACUUM (ANALYZE, VERBOSE) public.events;
```

You can run this from a maintenance job or via a cron container that has access
to the database.

### 3. Avoid VACUUM FULL in production

`VACUUM FULL` takes an exclusive lock and rewrites the table. It is rarely safe
for large production tables in Rails apps. Prefer:

- regular `VACUUM (ANALYZE)`
- index reindexing in isolation
- table partitioning for time-series data

## Rails migration for per-table settings

You can set per-table autovacuum settings using a migration. This is repeatable
and versioned.

```ruby
class TuneAutovacuumForEvents < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
      ALTER TABLE public.events SET (
        autovacuum_vacuum_scale_factor = 0.02,
        autovacuum_vacuum_threshold = 5000,
        autovacuum_analyze_scale_factor = 0.01,
        autovacuum_analyze_threshold = 5000
      );
    SQL
  end

  def down
    execute <<~SQL
      ALTER TABLE public.events RESET (
        autovacuum_vacuum_scale_factor,
        autovacuum_vacuum_threshold,
        autovacuum_analyze_scale_factor,
        autovacuum_analyze_threshold
      );
    SQL
  end
end
```

## Monitoring: what to check

Use these queries to understand bloat and vacuum progress.

```sql
SELECT
  relname,
  n_live_tup,
  n_dead_tup,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_all_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 20;
```

If `n_dead_tup` stays high, autovacuum is falling behind. Consider:

- increasing autovacuum worker count
- increasing autovacuum cost limit
- lowering scale factor for that table

## Large tables and Rails best practices

- Prefer append-only tables when possible.
- Use soft deletes sparingly on very large tables.
- Partition time-series tables to reduce vacuum scope.
- Keep btree indexes lean; remove unused indexes.
- Reindex in a controlled maintenance window if needed.

## Summary

Vacuum keeps PostgreSQL healthy by reclaiming space and keeping statistics
current. In Rails apps with large tables, per-table autovacuum tuning and
scheduled `VACUUM (ANALYZE)` provide the best balance of safety and performance.
Reserve `VACUUM FULL` for rare, offline maintenance.
