---
layout: post
section-type: post
title: Expression Indexes and Operator Classes support for PostgreSQL
category: rails-7.0.4
tags: [ 'ruby', 'rails', 'tech' ]
comments: false
---

# Expression Indexes

If you're using functions in SQL queries, e.g. LOWER() or UPPER(), you need to be careful! When using a function to a select a column, existing indexes cannot be used! Create a functional index (an index on LOWER(column)).

Now this has been supported in rails for postgresql from version 7.0.4

```ruby
create_table :users do |t|
  t.string :name
  t.index 'lower(name) varchar_pattern_ops'
end
```

# Operator Classes

[The operator](https://www.postgresql.org/docs/current/indexes-opclass.html) class identifies the operators to be used by the index for that column. For example, a B-tree index on the type int4 would use the int4_ops class.

*Before*

The gist_trgm_ops after name is the operator class to use when using the index. Currently it's possible to specify ... USING gist (name) but there's no way of adding the operator class after name.

*After*

Operator classes can be explicitly specified in add_index as:

`add_index :users, :name, using: :gist, opclass: { name: :gist_trgm_ops }`

In Schema `CREATE INDEX users_name ON users USING gist (name gist_trgm_ops);`


