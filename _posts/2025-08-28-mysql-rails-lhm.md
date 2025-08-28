---
layout: post
section-type: post
title: Large Hadron Migrator - Online MySQL Schema Migrations without Downtime
category: ruby
tags: [ 'mysql', 'rails', 'migrations', 'lhm', 'database' ]
comments: true
---

# Large Hadron Migrator - Online MySQL Schema Migrations without Downtime

When your Rails application grows and your database tables reach millions of records, traditional `ALTER TABLE` migrations can become a nightmare. They lock your tables for extended periods, potentially taking your site down for hours during critical schema changes. This is where [Large Hadron Migrator (LHM)](https://github.com/soundcloud/lhm) comes to the rescue.

## The Problem with Traditional Migrations

Rails-style database migrations work beautifully for small to medium-sized applications. However, as your tables grow larger, the locking nature of `ALTER TABLE` statements becomes problematic:

- **Extended downtime** during migrations on large tables
- **Blocking queries** while schema changes are applied
- **Risk of timeouts** on massive datasets
- **Development bottlenecks** as teams avoid necessary schema changes

## What is Large Hadron Migrator?

Large Hadron Migrator (LHM) is a Ruby gem developed by SoundCloud that enables **online schema migrations** for MySQL databases. Instead of locking your entire table during an `ALTER TABLE` operation, LHM performs migrations while your system remains live and operational.

### How LHM Works

LHM uses a clever approach involving:
1. **Copy table creation** - Creates a new table with the desired schema
2. **Trigger-based synchronization** - Keeps the copy table in sync with ongoing changes
3. **Chunked data copying** - Copies data in small batches to avoid long locks
4. **Atomic table swap** - Replaces the original table with the migrated version

## Installation and Setup

Add LHM to your Gemfile:

```ruby
gem 'lhm'
```

Then run:

```bash
bundle install
```

## Basic Usage Examples

### Simple Column Addition

```ruby
require 'lhm'

class AddArbitraryColumnToUsers < ActiveRecord::Migration
  def self.up
    Lhm.change_table :users do |m|
      m.add_column :arbitrary, "INT(12)"
      m.add_column :locale, "VARCHAR(2) NOT NULL DEFAULT 'en'"
    end
  end

  def self.down
    Lhm.change_table :users do |m|
      m.remove_column :arbitrary
      m.remove_column :locale
    end
  end
end
```

### Adding Indexes

```ruby
class AddIndexesToUsers < ActiveRecord::Migration
  def self.up
    Lhm.change_table :users do |m|
      m.add_index [:email, :created_at]
      m.add_index :status
    end
  end

  def self.down
    Lhm.change_table :users do |m|
      m.remove_index [:email, :created_at]
      m.remove_index :status
    end
  end
end
```

### Custom DDL Operations

```ruby
class CustomUserMigration < ActiveRecord::Migration
  def self.up
    Lhm.change_table :users do |m|
      m.ddl("alter table %s add column is_premium tinyint(1) default 0" % m.name)
      m.ddl("alter table %s add column subscription_expires_at datetime" % m.name)
    end
  end
end
```

## Advanced Configuration

### Throttling for Performance Control

LHM provides throttling mechanisms to control the migration pace and reduce database load:

```ruby
# Custom time-based throttler
my_throttler = Lhm::Throttler::Time.new(stride: 1000, delay: 10)

Lhm.change_table :users, throttler: my_throttler do |m|
  m.add_column :new_field, "VARCHAR(255)"
end
```

### Slave Lag Throttler

For production environments with read replicas, use the slave lag throttler:

```ruby
# Monitor slave lag and throttle accordingly
Lhm.change_table :users, throttler: :slave_lag_throttler do |m|
  m.add_column :premium_expires_at, "DATETIME"
end
```

Set as default in an initializer:

```ruby
# config/initializers/lhm.rb
Lhm.setup_throttler(:slave_lag_throttler)
```

### Table Rename Strategies

LHM offers two table rename strategies:

```ruby
# Atomic switcher (default, recommended)
Lhm.change_table :users, atomic_switch: true do |m|
  m.add_column :new_field, "TEXT"
end

# Locked switcher (for MySQL versions with binlog issues)
Lhm.change_table :users, atomic_switch: false do |m|
  m.add_column :new_field, "TEXT"
end
```

## Data Filtering During Migration

You can limit which data gets migrated using filters:

```ruby
# Only migrate public posts with valid users
Lhm.change_table :posts do |m|
  m.filter("inner join users on users.id = posts.user_id where posts.status = 'published'")
  m.add_column :view_count, "INT(11) DEFAULT 0"
end
```

## Production Best Practices

### 1. Pre-migration Checklist

```ruby
# Check table size before migration
def check_table_size
  result = ActiveRecord::Base.connection.execute(
    "SELECT table_rows, data_length, index_length
     FROM information_schema.tables
     WHERE table_name = 'users'"
  )

  puts "Table rows: #{result.first[0]}"
  puts "Data size: #{(result.first[1].to_f / 1024 / 1024).round(2)} MB"
  puts "Index size: #{(result.first[2].to_f / 1024 / 1024).round(2)} MB"
end
```

### 2. Monitoring Migration Progress

```ruby
# Create a monitoring script
class LhmMonitor
  def self.monitor_migration(table_name)
    loop do
      progress = check_lhm_progress(table_name)
      puts "Migration progress: #{progress}%"
      sleep 30
      break if progress >= 100
    end
  end

  private

  def self.check_lhm_progress(table_name)
    # Check for LHM temporary tables and triggers
    lhm_tables = ActiveRecord::Base.connection.execute(
      "SHOW TABLES LIKE 'lhm_%'"
    )

    return 100 if lhm_tables.count == 0

    # Calculate progress based on row counts
    original_count = ActiveRecord::Base.connection.execute(
      "SELECT COUNT(*) FROM #{table_name}"
    ).first[0]

    lhm_table = lhm_tables.first[0]
    migrated_count = ActiveRecord::Base.connection.execute(
      "SELECT COUNT(*) FROM #{lhm_table}"
    ).first[0]

    (migrated_count.to_f / original_count * 100).round(2)
  end
end
```

### 3. Cleanup After Interruptions

If a migration is interrupted, clean up leftover tables:

```ruby
# Check what LHM artifacts exist
Lhm.cleanup

# Remove orphaned tables and triggers
Lhm.cleanup(:run)

# Remove only tables older than 1 day
Lhm.cleanup(:run, until: 1.day.ago)
```

## Real-world Migration Example

Here's a comprehensive example for a production environment:

```ruby
class MigrateUsersTableForPremiumFeatures < ActiveRecord::Migration
  def self.up
    # Configure throttling for production load
    throttler = Lhm::Throttler::Time.new(stride: 2000, delay: 0.1)

    Lhm.change_table :users,
                     throttler: throttler,
                     atomic_switch: true do |m|

      # Add premium-related columns
      m.add_column :subscription_type, "ENUM('free', 'premium', 'enterprise') DEFAULT 'free'"
      m.add_column :subscription_expires_at, "DATETIME NULL"
      m.add_column :premium_features, "JSON NULL"
      m.add_column :billing_address_id, "INT(11) NULL"

      # Add indexes for performance
      m.add_index [:subscription_type, :subscription_expires_at]
      m.add_index :billing_address_id

      # Add foreign key constraint
      m.ddl("ALTER TABLE %s ADD CONSTRAINT fk_users_billing_address
             FOREIGN KEY (billing_address_id) REFERENCES billing_addresses(id)" % m.name)
    end

    puts "Migration completed successfully!"
  end

  def self.down
    Lhm.change_table :users do |m|
      m.remove_index [:subscription_type, :subscription_expires_at]
      m.remove_index :billing_address_id
      m.remove_column :subscription_type
      m.remove_column :subscription_expires_at
      m.remove_column :premium_features
      m.remove_column :billing_address_id
    end
  end
end
```

## Performance Considerations

### Memory and CPU Usage

```ruby
# Monitor system resources during migration
class ResourceMonitor
  def self.log_system_stats
    memory_usage = `ps -o rss= -p #{Process.pid}`.strip.to_i / 1024
    cpu_usage = `ps -o %cpu= -p #{Process.pid}`.strip.to_f

    Rails.logger.info "LHM Migration - Memory: #{memory_usage}MB, CPU: #{cpu_usage}%"
  end
end
```

### Database Connection Pooling

```ruby
# Ensure adequate connection pool size
# config/database.yml
production:
  adapter: mysql2
  pool: 25  # Increase pool size for LHM
  timeout: 5000
  variables:
    innodb_lock_wait_timeout: 10
```

## Limitations and Considerations

### Requirements
- **MySQL only** - LHM doesn't support PostgreSQL or other databases
- **Single integer primary key** - Must have an `id` column as the primary key
- **ActiveRecord connection** - Requires an established ActiveRecord connection

### Performance Considerations
- **Sparse ID assignment** can cause performance issues
- **Large tables** may require extended migration times
- **Slave lag** should be monitored in replication setups

### Safety Notes
```ruby
# Always test migrations in staging first
unless Rails.env.production?
  # Add extra safety checks for non-production environments
  puts "Running LHM migration in #{Rails.env} environment"
end

# Verify table structure before migration
def verify_table_structure
  columns = ActiveRecord::Base.connection.columns(:users)
  id_column = columns.find { |col| col.name == 'id' }

  unless id_column&.type == :integer && id_column.primary
    raise "Table must have an integer primary key named 'id'"
  end
end
```

## Conclusion

Large Hadron Migrator is an essential tool for any Rails application dealing with large MySQL databases. It enables zero-downtime schema migrations, allowing you to:

- **Maintain service availability** during critical schema changes
- **Perform migrations safely** on production databases
- **Control migration pace** through intelligent throttling
- **Monitor and manage** long-running migrations

By incorporating LHM into your deployment pipeline, you can confidently evolve your database schema without the fear of extended downtime or service disruptions.

For teams managing large-scale Rails applications, LHM represents the difference between risky, scheduled maintenance windows and seamless, continuous deployment capabilities. As developed and battle-tested by SoundCloud, it provides the reliability and performance needed for production environments.

Whether you're adding columns, creating indexes, or performing complex schema transformations, LHM ensures your users experience uninterrupted service while your database evolves to meet your application's growing needs.
