---
layout: post
section-type: post
title: Migrating from mysql2 to Trilogy Database Adapter in Rails
category: ruby
tags: [ 'ruby', 'rails', 'mysql', 'trilogy', 'database' ]
comments: false
---

# Migrating from mysql2 to Trilogy Database Adapter in Rails

As Ruby on Rails applications evolve and scale, developers are always looking for ways to improve performance, memory efficiency, and reliability. One significant advancement in the Rails ecosystem is the introduction of the Trilogy database adapter as an alternative to the traditional mysql2 adapter. In this comprehensive guide, we'll explore what Trilogy is, how to migrate from mysql2, and the benefits it brings to your Rails applications.

## What is Trilogy?

[Trilogy](https://github.com/trilogy-libraries/trilogy) is a modern, high-performance MySQL-compatible database adapter for Ruby, developed by GitHub. It was designed from the ground up to address some of the limitations and performance bottlenecks found in the mysql2 gem. Trilogy aims to provide better memory efficiency, improved connection handling, and enhanced performance for Ruby applications that interact with MySQL databases.

### Key Features of Trilogy

**Native C Implementation**: Trilogy is implemented in C, providing direct communication with MySQL servers without the overhead of additional abstraction layers.

**Memory Efficiency**: Optimized memory usage patterns that reduce garbage collection pressure and memory fragmentation.

**Modern Protocol Support**: Full support for modern MySQL protocol features and authentication methods.

**Connection Pooling**: Improved connection management and pooling mechanisms.

**Error Handling**: Better error reporting and handling compared to mysql2.

## Understanding Trilogy with Examples

Let's start with some basic examples to understand how Trilogy works in practice.

### Basic Connection Example

```ruby
require 'trilogy'

# Basic connection
client = Trilogy.new(
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'my_app_production'
)

# Execute a simple query
result = client.query("SELECT VERSION()")
puts result.to_a.first['VERSION()']

# Close the connection
client.close
```

### Connection with SSL Configuration

```ruby
require 'trilogy'

# SSL-enabled connection
client = Trilogy.new(
  host: 'mysql.example.com',
  port: 3306,
  username: 'app_user',
  password: 'secure_password',
  database: 'production_db',
  ssl_mode: :required,
  ssl_ca: '/path/to/ca-cert.pem',
  ssl_cert: '/path/to/client-cert.pem',
  ssl_key: '/path/to/client-key.pem'
)

# Execute queries with SSL protection
users = client.query("SELECT id, email FROM users LIMIT 10")
users.each do |user|
  puts "User: #{user['id']} - #{user['email']}"
end

client.close
```

### Prepared Statements with Trilogy

```ruby
require 'trilogy'

client = Trilogy.new(
  host: 'localhost',
  username: 'root',
  password: 'password',
  database: 'my_app'
)

# Prepare a statement
stmt = client.prepare("SELECT * FROM users WHERE age > ? AND city = ?")

# Execute with parameters
result = stmt.execute(25, 'San Francisco')
result.each do |row|
  puts "#{row['name']} (#{row['age']}) from #{row['city']}"
end

# Clean up
stmt.close
client.close
```

### Connection Pool Example

```ruby
require 'trilogy'
require 'connection_pool'

# Create a connection pool
pool = ConnectionPool.new(size: 10, timeout: 5) do
  Trilogy.new(
    host: 'localhost',
    username: 'app_user',
    password: 'app_password',
    database: 'production_db',
    read_timeout: 10,
    write_timeout: 10
  )
end

# Use the pool
pool.with do |client|
  result = client.query("SELECT COUNT(*) as count FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY")
  daily_orders = result.first['count']
  puts "Orders in the last 24 hours: #{daily_orders}"
end
```

## Rails Integration Examples

### ActiveRecord Configuration

In your Rails application, you can configure Trilogy in your `database.yml`:

```yaml
# config/database.yml
production:
  adapter: trilogy
  encoding: utf8mb4
  collation: utf8mb4_unicode_ci
  database: my_app_production
  username: app_user
  password: <%= Rails.application.credentials.database[:password] %>
  host: mysql.production.com
  port: 3306
  pool: 25
  timeout: 5000

  # Trilogy-specific configurations
  read_timeout: 10
  write_timeout: 10
  connect_timeout: 5

  # SSL configuration
  ssl_mode: required
  ssl_ca: /path/to/ca-cert.pem
```

### Custom Trilogy Configuration Class

```ruby
# config/initializers/trilogy.rb
class TrilogyConfiguration
  def self.configure
    ActiveRecord::Base.trilogy_adapter_class.class_eval do
      # Custom configuration for Trilogy connections
      def configure_connection
        super

        # Set custom timeouts
        @connection.query_options[:read_timeout] = 30
        @connection.query_options[:write_timeout] = 30

        # Set session variables
        execute("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'")
        execute("SET SESSION innodb_lock_wait_timeout = 10")
      end
    end
  end
end

# Apply configuration after Rails initializes
Rails.application.config.after_initialize do
  TrilogyConfiguration.configure
end
```

## Step-by-Step Migration Guide

### Step 1: Update Your Gemfile

First, you'll need to add the trilogy gem and remove or comment out mysql2:

```ruby
# Gemfile

# Comment out or remove the mysql2 gem
# gem 'mysql2', '~> 0.5'

# Add the trilogy gem
gem 'trilogy', '~> 2.4'

# If you're using Rails 7.1+, you might also need:
gem 'activerecord-trilogy-adapter', '~> 3.0'
```

Run bundle install:

```bash
bundle install
```

### Step 2: Update Database Configuration

Update your `config/database.yml` file to use the trilogy adapter:

```yaml
# config/database.yml

default: &default
  adapter: trilogy  # Changed from mysql2
  encoding: utf8mb4
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000

  # Trilogy-specific timeouts
  read_timeout: 10
  write_timeout: 10
  connect_timeout: 5

development:
  <<: *default
  database: my_app_development
  username: root
  password:
  host: localhost

test:
  <<: *default
  database: my_app_test
  username: root
  password:
  host: localhost

production:
  <<: *default
  database: my_app_production
  username: <%= Rails.application.credentials.database[:username] %>
  password: <%= Rails.application.credentials.database[:password] %>
  host: <%= Rails.application.credentials.database[:host] %>
  port: 3306

  # Production-specific settings
  pool: 25
  ssl_mode: required
```

### Step 3: Handle Custom mysql2 Code

If you have any direct mysql2-specific code in your application, you'll need to update it. Here are common scenarios:

#### Raw Database Connections

**Before (mysql2):**
```ruby
# Using mysql2 directly
require 'mysql2'

client = Mysql2::Client.new(
  host: 'localhost',
  username: 'root',
  database: 'my_app'
)

result = client.query("SELECT * FROM users")
result.each do |row|
  puts row['name']
end
```

**After (Trilogy):**
```ruby
# Using Trilogy directly
require 'trilogy'

client = Trilogy.new(
  host: 'localhost',
  username: 'root',
  database: 'my_app'
)

result = client.query("SELECT * FROM users")
result.each do |row|
  puts row['name']
end
```

#### Custom Connection Handling

**Before (mysql2):**
```ruby
class DatabaseService
  def initialize
    @client = Mysql2::Client.new(database_config)
  end

  def execute_query(sql)
    @client.query(sql, symbolize_keys: true)
  rescue Mysql2::Error => e
    Rails.logger.error "Database error: #{e.message}"
    raise
  end
end
```

**After (Trilogy):**
```ruby
class DatabaseService
  def initialize
    @client = Trilogy.new(database_config)
  end

  def execute_query(sql)
    result = @client.query(sql)
    # Convert to symbolized hash if needed
    result.map(&:symbolize_keys)
  rescue Trilogy::Error => e
    Rails.logger.error "Database error: #{e.message}"
    raise
  end
end
```

### Step 4: Update Connection Pool Configuration

If you're using custom connection pooling, update it for Trilogy:

```ruby
# config/initializers/database.rb

class CustomConnectionPool
  def self.setup
    config = Rails.application.config.database_configuration[Rails.env]

    # Remove mysql2-specific options
    trilogy_config = config.except('adapter').merge(
      # Add Trilogy-specific options
      read_timeout: config['read_timeout'] || 10,
      write_timeout: config['write_timeout'] || 10,
      connect_timeout: config['connect_timeout'] || 5
    )

    @pool = ConnectionPool.new(size: config['pool'] || 5) do
      Trilogy.new(trilogy_config.symbolize_keys)
    end
  end

  def self.with_connection(&block)
    @pool.with(&block)
  end
end
```

### Step 5: Test the Migration

Before deploying to production, thoroughly test your application:

```ruby
# Create a test script to verify the migration
# test/trilogy_migration_test.rb

require 'test_helper'

class TrilogyMigrationTest < ActiveSupport::TestCase
  test "database connection works with trilogy" do
    assert ActiveRecord::Base.connection.active?
    assert_equal 'Trilogy', ActiveRecord::Base.connection.class.name
  end

  test "basic queries work" do
    user_count = User.count
    assert user_count >= 0

    # Test complex query
    recent_users = User.where("created_at > ?", 1.week.ago).limit(10)
    assert recent_users.is_a?(ActiveRecord::Relation)
  end

  test "transactions work correctly" do
    initial_count = User.count

    User.transaction do
      User.create!(name: "Test User", email: "test@example.com")
      raise ActiveRecord::Rollback
    end

    assert_equal initial_count, User.count
  end

  test "prepared statements work" do
    user = User.where(id: 1).first
    assert_not_nil user if User.count > 0
  end
end
```

Run your test suite:

```bash
# Run the specific migration test
rails test test/trilogy_migration_test.rb

# Run your full test suite
rails test

# Run system tests
rails test:system
```

### Step 6: Monitor Performance

Create monitoring scripts to compare performance:

```ruby
# scripts/performance_comparison.rb

require 'benchmark'

class PerformanceMonitor
  def self.benchmark_queries
    puts "Benchmarking database operations with Trilogy..."

    Benchmark.bm(20) do |x|
      x.report("Simple SELECT:") do
        1000.times { User.first }
      end

      x.report("Complex JOIN:") do
        100.times do
          User.joins(:orders)
              .where("orders.created_at > ?", 1.month.ago)
              .limit(10)
              .to_a
        end
      end

      x.report("Bulk INSERT:") do
        User.transaction do
          100.times do |i|
            User.create!(
              name: "Bulk User #{i}",
              email: "bulk#{i}@example.com"
            )
          end
        end
      end

      x.report("Connection pool:") do
        threads = []
        10.times do
          threads << Thread.new do
            50.times { User.count }
          end
        end
        threads.each(&:join)
      end
    end
  end
end

# Run the benchmark
PerformanceMonitor.benchmark_queries
```

## Deployment Considerations

### Rolling Deployment Strategy

For production deployments, consider a rolling update approach:

```yaml
# docker-compose.yml for blue-green deployment
version: '3.8'
services:
  app-blue:
    build: .
    environment:
      - DATABASE_ADAPTER=mysql2
      - RAILS_ENV=production
    depends_on:
      - mysql

  app-green:
    build: .
    environment:
      - DATABASE_ADAPTER=trilogy
      - RAILS_ENV=production
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: app_production
```

### Health Checks

Implement health checks for Trilogy connections:

```ruby
# app/controllers/health_controller.rb
class HealthController < ApplicationController
  def database
    start_time = Time.current

    # Test basic connectivity
    ActiveRecord::Base.connection.execute("SELECT 1")

    # Test query performance
    User.limit(1).to_a

    response_time = (Time.current - start_time) * 1000

    render json: {
      status: 'ok',
      adapter: ActiveRecord::Base.connection.adapter_name,
      response_time_ms: response_time.round(2),
      pool_size: ActiveRecord::Base.connection_pool.size,
      active_connections: ActiveRecord::Base.connection_pool.connections.count
    }
  rescue => e
    render json: {
      status: 'error',
      error: e.message,
      adapter: 'unknown'
    }, status: 503
  end
end
```

## Benefits of Trilogy over mysql2

### 1. Enhanced Performance

**Memory Efficiency**: Trilogy uses significantly less memory than mysql2, especially for applications with high connection counts or large result sets.

```ruby
# Performance comparison example
require 'benchmark'
require 'memory_profiler'

def memory_usage_comparison
  # Before migration (conceptual - you'd run this with mysql2)
  mysql2_report = MemoryProfiler.report do
    1000.times { User.limit(100).to_a }
  end

  # After migration with Trilogy
  trilogy_report = MemoryProfiler.report do
    1000.times { User.limit(100).to_a }
  end

  puts "mysql2 total allocated: #{mysql2_report.total_allocated_memsize}"
  puts "Trilogy total allocated: #{trilogy_report.total_allocated_memsize}"
  puts "Memory improvement: #{((mysql2_report.total_allocated_memsize - trilogy_report.total_allocated_memsize) / mysql2_report.total_allocated_memsize.to_f * 100).round(2)}%"
end
```

**Faster Query Execution**: Optimized C implementation provides faster query execution times.

```ruby
# Benchmark query performance
Benchmark.bm(15) do |x|
  x.report("Large result set:") do
    Product.joins(:category).limit(10000).to_a
  end

  x.report("Complex aggregation:") do
    Order.group(:status)
         .joins(:user)
         .where("created_at > ?", 30.days.ago)
         .count
  end
end
```

### 2. Better Connection Management

**Improved Connection Pooling**: Trilogy provides more efficient connection pooling with better resource cleanup.

```ruby
# Monitor connection pool efficiency
class ConnectionPoolMonitor
  def self.stats
    pool = ActiveRecord::Base.connection_pool

    {
      size: pool.size,
      checked_out: pool.checked_out_connections,
      available: pool.available_connection_count,
      queue_length: pool.num_waiting_in_queue,
      reaper_frequency: pool.reaper&.frequency
    }
  end

  def self.log_stats
    stats = self.stats
    Rails.logger.info "Connection Pool Stats: #{stats}"
    stats
  end
end

# Use in a background job or monitoring system
ConnectionPoolMonitor.log_stats
```

**Connection Timeout Handling**: More robust timeout handling prevents connection leaks.

```ruby
# config/application.rb
config.after_initialize do
  ActiveRecord::Base.connection_pool.with_connection do |conn|
    # Trilogy provides better timeout configuration
    conn.execute("SET SESSION wait_timeout = 28800")
    conn.execute("SET SESSION interactive_timeout = 28800")
  end
end
```

### 3. Enhanced Security Features

**Better SSL/TLS Support**: Improved SSL configuration and certificate validation.

```yaml
# Enhanced SSL configuration with Trilogy
production:
  adapter: trilogy
  ssl_mode: verify_identity  # Stronger than mysql2's ssl_mode
  ssl_ca: /path/to/ca-cert.pem
  ssl_cert: /path/to/client-cert.pem
  ssl_key: /path/to/client-key.pem
  ssl_cipher: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256'
```

**Modern Authentication**: Support for latest MySQL authentication plugins.

```ruby
# Modern authentication support
client = Trilogy.new(
  host: 'mysql8-server.com',
  username: 'app_user',
  password: 'secure_password',
  database: 'production_db',
  auth_plugin: 'caching_sha2_password'  # MySQL 8.0 default
)
```

### 4. Improved Error Handling and Debugging

**Detailed Error Messages**: Better error reporting for debugging database issues.

```ruby
# Enhanced error handling with Trilogy
class DatabaseErrorHandler
  def self.handle_trilogy_errors
    yield
  rescue Trilogy::ConnectionError => e
    Rails.logger.error "Connection failed: #{e.message}"
    # Trilogy provides more specific error types
    case e.error_code
    when 2003
      Rails.logger.error "Cannot connect to MySQL server"
    when 1045
      Rails.logger.error "Access denied for user"
    when 1049
      Rails.logger.error "Unknown database"
    end
    raise
  rescue Trilogy::QueryError => e
    Rails.logger.error "Query failed: #{e.message}"
    Rails.logger.error "SQL State: #{e.sql_state}"
    raise
  end
end
```

**Better Monitoring Capabilities**: Enhanced metrics and monitoring support.

```ruby
# Advanced monitoring with Trilogy
class TrilogyMonitor
  def self.connection_metrics
    ActiveRecord::Base.connection_pool.with_connection do |conn|
      {
        server_version: conn.server_version,
        client_version: Trilogy::VERSION,
        connection_id: conn.thread_id,
        ssl_enabled: conn.ssl_cipher.present?,
        charset: conn.charset,
        timezone: conn.query("SELECT @@session.time_zone").first.values.first
      }
    end
  end

  def self.query_performance_stats
    # Trilogy provides better introspection
    stats = ActiveRecord::Base.connection.query_cache_stats
    {
      query_cache_enabled: ActiveRecord::Base.connection.query_cache_enabled,
      query_cache_size: stats[:size],
      cache_hits: stats[:hits],
      cache_misses: stats[:misses]
    }
  end
end
```

### 5. Long-term Sustainability

**Active Development**: Trilogy is actively maintained by GitHub with regular updates and improvements.

**Modern Codebase**: Built with modern C practices and memory management techniques.

**Community Support**: Growing community adoption and contribution.

```ruby
# Check Trilogy version and features
puts "Trilogy version: #{Trilogy::VERSION}"
puts "Supported features: #{Trilogy.features}"

# Performance monitoring for long-term tracking
class PerformanceTracker
  def self.track_migration_benefits
    metrics = {
      memory_usage: `ps -o rss= -p #{Process.pid}`.strip.to_i,
      connection_count: ActiveRecord::Base.connection_pool.connections.size,
      query_response_time: benchmark_query_time,
      error_rate: calculate_error_rate
    }

    # Store metrics for trend analysis
    Rails.cache.write("trilogy_metrics_#{Time.current.to_date}", metrics)
    metrics
  end

  private

  def self.benchmark_query_time
    start_time = Time.current
    User.limit(100).to_a
    (Time.current - start_time) * 1000
  end

  def self.calculate_error_rate
    # Implementation depends on your error tracking system
    0.0
  end
end
```

## Conclusion

Migrating from mysql2 to Trilogy represents a significant step forward for Rails applications that rely on MySQL databases. The migration process, while requiring careful planning and testing, offers substantial benefits in terms of performance, memory efficiency, and long-term maintainability.

The key advantages of Trilogy include:

- **Reduced memory footprint** and better garbage collection behavior
- **Improved connection pooling** and resource management
- **Enhanced security features** with modern SSL/TLS support
- **Better error handling** and debugging capabilities
- **Active development** backed by GitHub's expertise

When planning your migration, remember to:

1. Thoroughly test in development and staging environments
2. Update any direct mysql2 dependencies in your codebase
3. Monitor performance metrics before and after migration
4. Plan for a gradual rollout in production environments
5. Update your monitoring and alerting systems to work with Trilogy

As the Rails ecosystem continues to evolve, Trilogy represents the future of MySQL connectivity for Ruby applications. By migrating now, you're positioning your application for better performance and long-term sustainability.

Whether you're building a new application or maintaining an existing one, Trilogy offers a compelling upgrade path that delivers immediate performance benefits while future-proofing your database connectivity layer.

