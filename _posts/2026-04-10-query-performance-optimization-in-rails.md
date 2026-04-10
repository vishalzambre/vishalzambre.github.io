---
layout: post
section-type: post
title: "Advanced Query Performance Optimization in Rails"
category: ruby
tags: [ 'ruby', 'rails', 'activerecord', 'postgresql', 'performance', 'sql' ]
comments: true
---

Rails makes it easy to ship features quickly, but the same abstractions that save time can hide expensive database work. Once you have moved past the basics—adding indexes, using `includes` to avoid N+1 queries, and watching the development log—you still hit ceilings: memory spikes on large tables, surprise joins, slow counts, and APIs that “work in staging” but crawl in production.

This post focuses on **advanced** techniques: how Active Record issues SQL, how to shape queries for the planner, and how to keep Ruby’s object model from undoing database efficiency.

## 1. Know what `includes`, `preload`, and `eager_load` actually do

They all address association loading, but the SQL patterns differ:

- **`preload`** — One query per association; always separate `SELECT`s. No join row explosion. Good when joined tables are wide or cardinality is high.
- **`eager_load`** — Uses `LEFT OUTER JOIN` (often one big query). Can duplicate parent rows in the result set before Active Record deduplicates in Ruby. Powerful but easy to over-fetch columns.
- **`includes`** — Lets Active Record choose `preload` or `eager_load` depending on whether you reference the association in `where` / `order`.

When a single joined query becomes huge, force separate loads:

```ruby
Post.preload(:author, comments: :user).limit(50)
```

When you need filters on the association, you typically need a join path—then `eager_load` or explicit `joins` is appropriate.

## 2. `strict_loading`: fail fast on lazy loads

N+1 queries often return in code review as “we’ll fix it later.” Rails 6.1+ **`strict_loading`** turns lazy loads into errors in environments where you can afford it (tests, staging, or selective models):

```ruby
class Post < ApplicationRecord
  has_many :comments, strict_loading: true
end

# or per-query
Post.strict_loading.includes(:author).to_a
```

Pair this with good request- or job-level boundaries so developers notice missing preloads before production traffic does.

## 3. Narrow columns: `select`, `pluck`, `pick`, and ignored columns

Loading full rows for dashboards or APIs wastes I/O and memory, especially with wide tables (JSON blobs, large text).

- **`pluck`** / **`pick`** — Avoid instantiating models when you only need attributes.
- **`select`** — Fetch only what you need when you still want model instances.

```ruby
User.where(active: true).pluck(:id, :email)

Post.select(:id, :title, :published_at).where(published: true)
```

Rails 7+ **`ignored_columns`** (or `ignore_columns` in older apps) can prevent accidental selection of heavy columns in hot paths, at the cost of making those attributes unavailable unless you un-ignore or use raw SQL.

## 4. Streaming and batching: `find_each`, `in_batches`, and memory

`Post.all.each` loads the entire table into memory. For maintenance and backfills:

```ruby
Post.where("created_at < ?", 1.year.ago).in_batches(of: 1000) do |batch|
  batch.update_all(archived: true)
end
```

**Caveats:**

- `find_each` orders by primary key and ignores custom `order`—by design.
- Wrapping huge batches in a single transaction holds locks and bloats WAL; sometimes `in_batches` without a giant transaction (or smaller transactional units) is healthier.

## 5. Bulk writes: `insert_all`, `upsert_all`, and `update_all`

Per-row `create!` in a loop is round-trip heavy. When validations and callbacks can be bypassed safely (or handled elsewhere), **`insert_all`** / **`upsert_all`** reduce chatter dramatically:

```ruby
Book.insert_all(
  [{ title: "Example", isbn: "978-1", author: "Ada" }],
  unique_by: :isbn # PostgreSQL/SQLite: must name columns covered by a unique index
)
```

**`update_all`** / **`delete_all`** skip callbacks and touch attributes—use when that matches your data integrity story.

## 6. Scopes, `merge`, and unintentional table scans

Chaining scopes is convenient, but opaque `default_scope`, `unscoped` leaks, and dynamic `where` fragments can prevent index use. **`merge`** helps reuse another model’s relation without copying SQL strings:

```ruby
Post.joins(:comments).merge(Comment.visible)
```

Review the generated SQL for `OR` conditions, `LIKE '%foo%'`, and casts that prevent index usage on otherwise indexed columns.

## 7. PostgreSQL-oriented index strategies (beyond “add an index”)

Rails migrations support options that matter at scale:

- **Partial indexes** — Smaller, faster indexes for hot subsets (e.g. only non-deleted rows, only published posts).
- **Expression indexes** — For `LOWER(email)`, `WHERE (metadata->>'status')`, etc., matching how the app actually filters.
- **Covering indexes (`INCLUDE`)** — Lets index-only scans satisfy more queries without hitting the heap (PostgreSQL 11+).

Always validate with **`EXPLAIN (ANALYZE, BUFFERS)`** in a production-like dataset size; the planner’s choices change with cardinality and statistics.

## 8. Counts and existence checks

`Model.count` without a sensible scope can scan large ranges. Prefer:

- **`exists?`** when you only need a boolean.
- Cached counters (**`counter_cache`**) for belongs_to/has_many counts shown on parent records.
- Approximate counts only when product requirements allow (e.g. very large tables where exact counts are prohibitively expensive).

## 9. Caching inside the request: association identity and `preload`

Active Record caches loaded associations on the in-memory object for the same request. **`inverse_of`** (often automatic in modern Rails) reduces redundant queries when navigating both sides of an association.

For cross-request caching, fragment or Russian Doll caching is a different layer—but eliminating duplicate queries *within* one request is still worth doing in hot actions.

## 10. Read replicas and `connected_to`

For read-heavy endpoints, routing read queries to replicas avoids saturating the primary. Rails 6+ multi-db APIs such as **`connected_to(role: :reading)`** help, but you must understand replication lag: reads “immediately after write” may need the primary or a session stickiness strategy.

## 11. Observability: bullet, logs, and query tags

- **[bullet](https://github.com/flyerhzm/bullet)** — Flags N+1 and unused eager loading in development.
- **Verbose query logs** — Rails can tag SQL with controller/job names; use that to map spikes to code paths.
- **APM and database performance tools** — Track time in database vs Ruby, wait events, and slow query logs.

Advanced optimization is not guessing—it is measuring, changing one variable, and re-measuring.

## 12. When to step outside Active Record

Some patterns are clearer or faster in SQL or Arel than in chained scopes:

- Complex reporting with window functions.
- **`FROM`** subqueries or CTEs exposed via `Model.from("(...) posts")` when AR’s join APIs fight you.
- Database-specific features (e.g. `DISTINCT ON` in PostgreSQL) that have no first-class AR DSL.

Keep boundaries explicit: a well-named query object or repository method beats scattered raw SQL in controllers.

---

**Takeaway:** Advanced Rails query performance is mostly about **controlling how much data crosses the wire**, **how many round trips you make**, and **whether the database can use the right access path**. Mastering preload vs eager load, batching and bulk APIs, strict loading in CI, and PostgreSQL index design will solve most “we indexed it but it’s still slow” puzzles—then reach for SQL or replicas when the domain truly demands it.
