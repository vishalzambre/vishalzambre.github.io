---
layout: post
section-type: post
title: SQL Style Guide and Best Practices
category: sql
tags: [ 'sql', 'snowflake' ]
comments: false
---

# Data Team SQL Style Guide and Best Practices

This document is written as a manual for anyone working on the Data team, but also as a guide for anyone at the company who would like to write clean and clear code that is meant to be shared.

The individual tips in this guide are based on a composite of knowledge I've gleaned from experience and our some of blogs.

# Rules

## General stuff

* No tabs. 2 spaces per indent.
* No trailing whitespace.
* Always capitalize SQL keywords (e.g., `SELECT` or `AS`)
* Variable names should be underscore separated:

  __GOOD__:
  `SELECT COUNT(*) AS backers_count`

  __BAD__:
  `SELECT COUNT(*) AS backersCount`

* Don't use single letter variable names be as descriptive as possible given the context:

  __GOOD__:
  `SELECT ksr.backings AS backings_with_creators`

  __BAD__:
  `SELECT ksr.backings AS b`

* Use [Common Table Expressions](http://www.postgresql.org/docs/8.4/static/queries-with.html) (CTEs) early and often, and name them well.


## `SELECT`

After `SELECT` every column gets its own line and are indented:

```sql
SELECT
  projects.name,
  users.email,
  projects.country,
  COUNT(backings.id) AS backings_count
FROM ...
```

`SELECT` goes on its own line:

```sql
SELECT
  name,
...
```

However if a query returns a single column, it is fine to include the column name on the same line as the `SELECT`

```sql
SELECT *
FROM ...
```

```sql
SELECT customer_id
FROM ...
```

Always rename aggregates and function-wrapped columns:

```sql
SELECT
  name,
  SUM(amount) AS sum_amount
FROM ...
```

Any time 2 or more tables are involved in the query use table aliases

Always rename all columns when selecting with table aliases:

```sql
SELECT
  projects.name AS project_name,
  COUNT(backings.id) AS backings_count
FROM ksr.backings AS backings
INNER JOIN ksr.projects AS projects ON ...
```

Always use `AS` to rename columns:

__GOOD__:

```sql
SELECT
  projects.name AS project_name,
  COUNT(backings.id) AS backings_count
...
```

__BAD__:

```sql
SELECT
  projects.name project_name,
  COUNT(backings.id) backings_count
...
```

## `WINDOW FUNCTIONS`

Long Window functions should be split across multiple lines: one for the `PARTITION`, `ORDER` and frame clauses, aligned to the `PARTITION` keyword. Partition keys should exist on the same line. Order (`ASC`, `DESC`) should always be explicit. All window functions should be aliased.

```sql
ROW_NUMBER() OVER (
  PARTITION BY event, visit_id, invalid
  ORDER BY create_time
) AS order_number_valid
```

## `CASE STATEMENTS`

For a case statement, each conditional should be on its own line, indented.
The `THEN` statement should be indented from the `WHEN`.
The `ELSE` statement should be aligned with `WHEN`
Finally, the `END AS` should align with `CASE` as a nice wrapper for the entire CASE statement.


```sql
CASE
  WHEN nps > 8
    THEN 2
  WHEN nps IN (7,6)
    THEN 1
  ELSE 0
END AS nps
```

Long conditionals can stay on one line. It's fine. We know it will be ugly. We forgive you.

```sql
CASE
  WHEN event = 'survey' AND invalid = False AND nps > 8
    THEN 2
  WHEN nps IN (7,6) THEN 1
  ELSE 0
END AS nps
```

## `FROM`

Only one table should be in the `FROM`. [Always use explicit joins](https://stackoverflow.com/questions/44917/explicit-vs-implicit-sql-joins):

__GOOD__:

```sql
SELECT
  projects.name AS project_name,
  COUNT(backings.id) AS backings_count
FROM ksr.projects AS projects
INNER JOIN ksr.backings AS backings
  ON backings.project_id = projects.id
...
```

__BAD__:

```sql
SELECT
projects.name AS project_name,
COUNT(backings.id) AS backings_count
FROM ksr.projects AS projects, ksr.backings AS backings
...
```

## `JOIN`

Explicitly use `INNER JOIN` not just `JOIN`, making multiple lines of `INNER JOIN`s easier to scan. Also join conditions should have their own indented line:

__GOOD__:

```sql
SELECT
  projects.name AS project_name,
  COUNT(backings.id) AS backings_count
FROM ksr.projects AS projects
INNER JOIN ksr.backings AS backings
  ON ...
INNER JOIN ...
  ON ...
LEFT JOIN ksr.backer_rewards AS backer_rewards
  ON ...
LEFT JOIN ...
```

__BAD__:

```sql
SELECT
  projects.name AS project_name,
  COUNT(backings.id) AS backings_count
FROM ksr.projects AS projects
JOIN ksr.backings AS backings
  ON ...
LEFT JOIN ksr.backer_rewards AS backer_rewards
  ON ...
LEFT JOIN ...
```

Additional filters in the `INNER JOIN` go on new indented lines:

```sql
SELECT
  projects.name AS project_name,
  COUNT(backings.id) AS backings_count
FROM ksr.projects AS projects
INNER JOIN ksr.backings AS backings
  ON projects.id = backings.project_id
  AND backings.project_country != 'US'
...
```

When possible begin with `INNER JOIN`s and then list `LEFT JOIN`s and do not intermingle `LEFT JOIN`s with `INNER JOIN`s unless necessary.
The only exception to this rule is when the correctness of a query requires a `LEFT JOIN` to be earlier in the list:

__GOOD__:

```sql
INNER JOIN ksr.backings AS backings
  ON ...
INNER JOIN ksr.users AS users
  ON ...
INNER JOIN ksr.locations AS locations
  ON ...
LEFT JOIN ksr.backer_rewards AS backer_rewards
  ON ...
LEFT JOIN ...
```

__BAD__:

```sql
LEFT JOIN ksr.backer_rewards AS backer_rewards
  ON backings
INNER JOIN ksr.users AS users
  ON ...
LEFT JOIN ...
  ON ...
INNER JOIN ksr.locations AS locations
  ON ...
```

## `WHERE`

Multiple `WHERE` clauses should go on different lines and begin with the SQL operator:

```sql
SELECT
  name,
  goal
FROM ksr.projects AS projects
WHERE
  country = 'US'
  AND deadline >= '2015-01-01'
...
```

## Semi Structured Data

The following rules for handling semi-structured data are [Snowflake](https://docs.snowflake.net/manuals/user-guide/semistructured-concepts.html) specific.

Access fields within `VARIANT` (Snowflake's semi structured data type) by using `:`

__GOOD__:

```sql
SELECT
  data:customer_id,
...
```

__BAD__:

```sql
SELECT
  data['customer_id'],
...
```

Always cast fields pulled from `VARIANT` columns (otherwise they will still be `VARIANT` rather than their actual data type)

```sql
SELECT
  data:customer_id::int AS customer_id,
  data:date_created::timestamp AS date_timestamp
FROM ...
```

## Comments

Comments should be brief and only contain essential information. A top level comment can enclosed in `/* */`. Within the actual SQL it is best to keep comments concise so it is best to use `--`.

## Common Table Expressions (CTEs)

[From AWS](http://docs.aws.amazon.com/redshift/latest/dg/r_WITH_clause.html):

>`WITH` clause subqueries are an efficient way of defining tables that can be used throughout the execution of a single query. In all cases, the same results can be achieved by using subqueries in the main body of the `SELECT` statement, but `WITH` clause subqueries may be simpler to write and read.

The body of a CTE must be one indent further than the `WITH` keyword. Open them at the end of a line and close them on a new line:

```sql
WITH backings_per_category AS (
  SELECT
  category_id,
  deadline,
  ...
)
```

Multiple CTEs should be formatted accordingly:

```sql
WITH backings_per_category AS (
  SELECT
  ...
), backers AS (
  SELECT
  ...
), backers_and_creators AS (
  ...
)
SELECT * FROM backers;
```

If possible, `JOIN` CTEs inside subsequent CTEs, not in the main clause. CTEs should go at the bottom of the list:

__GOOD__:

```sql
WITH backings_per_category AS (
  SELECT
  ...
), backers AS (
  SELECT
    backer_id,
    COUNT(backings_per_category.id) AS projects_backed_per_category
  INNER JOIN ksr.users AS users
    ON users.id = backings_per_category.backer_id
), backers_and_creators AS (
  ...
)
SELECT * FROM backers_and_creators;
```

__BAD__:

```sql
WITH backings_per_category AS (
  SELECT
  ...
), backers AS (
  SELECT
    backer_id,
    COUNT(backings_per_category.id) AS projects_backed_per_category
), backers_and_creators AS (
  ...
)
SELECT *
FROM backers_and_creators
INNER JOIN backers ON backers_and_creators
  ON backers.backer_id = backers_and_creators.backer_id
```

Always use CTEs over inlined subqueries.

## A note on newlines

Keep your query together. Do not separate out statements or group "like"
parts of a query together with newlines. If a query looks too long and unweildy it's a sign you should consider a CTE (see above).

__BAD__:

```sql
SELECT
  name,
  model,
  type,
  cost

FROM
  cars

WHERE
  cost > 5,000

ORDER BY cost
```

__GOOD__:

```sql
SELECT
  name,
  model,
  type,
  cost
FROM
  cars
WHERE
  cost > 5,000
ORDER BY cost
```

Even if applying comments to individual lines, still keep the code together:

__GOOD__:

```sql
SELECT
  name,
  model,
  type,
  cost
FROM
  cars
WHERE
  -- I'm cheap, okay?
  cost < 5,000
ORDER BY cost
```

## `CREATE`
When creating database objects, please keep in mind the following:

### Do explicitly cast fields in the final SELECT

__GOOD__

```sql
SELECT
  projects.name::VARCHAR AS projects_name,
  projects.id::INTEGER AS projects_id
FROM ksr.projects AS projects
...
```

__BAD__:

```sql
SELECT
  projects.name AS projects_name,
  projects.id AS projects_id
FROM ksr.projects AS projects
...
```

### Do use CREATE OR REPLACE syntax
This will help prevent a failure where an object already exists you are attempting to overwrite

## Tips
