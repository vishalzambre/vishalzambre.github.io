---
layout: post
section-type: post
title: Title
category: Category
tags:  [ 'ruby', 'heroku', 'rails', 'devops' ]
comments: true
---

# = Deploying Rails Applications to Heroku
#
# == What is Heroku?
# Heroku is a cloud Platform as a Service (PaaS) that enables developers to deploy,
# manage, and scale Ruby on Rails applications.
#
# === Key Features:
# * Built-in support for Ruby and Rails
# * Automated deployment via Git
# * Integrated PostgreSQL database
# * Add-on marketplace for additional services
#
# == Prerequisites
#
# Before deploying your Rails application to Heroku, ensure you have:
#
# * Git installed and configured
# * Ruby version 3.0.0 or later
# * Rails version 7.0.0 or later
# * Bundler gem installed
# * Heroku CLI installed
# * PostgreSQL installed locally
#
# == Setting Up Your Rails Application
#
# === Database Configuration
#
# Replace SQLite with PostgreSQL in your Gemfile:
#
#   # Remove or comment out
#   # gem 'sqlite3'
#
#   # Add PostgreSQL gem
#   gem 'pg'
#
# Update your database.yml:
#
#   default: &default
#     adapter: postgresql
#     encoding: unicode
#     pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
#
#   development:
#     <<: *default
#     database: myapp_development
#
#   test:
#     <<: *default
#     database: myapp_test
#
#   production:
#     <<: *default
#     url: <%= ENV['DATABASE_URL'] %>
#
# === Asset Pipeline Configuration
#
# Ensure your assets are properly configured for production:
#
#   # config/environments/production.rb
#   config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?
#   config.assets.compile = false
#
# == Heroku Setup Process
#
# === 1. Install Heroku CLI
#
# For macOS:
#   brew install heroku/brew/heroku
#
# For Windows:
#   Download and run installer from Heroku website
#
# === 2. Login to Heroku
#
#   heroku login
#
# === 3. Create Heroku Application
#
#   heroku create your-app-name
#
# === 4. Configure Environment Variables
#
#   heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)
#   heroku config:set RAILS_ENV=production
#
# == Deployment Steps
#
# === 1. Prepare Your Application
#
#   bundle install
#   git add .
#   git commit -m "Prepare for Heroku deployment"
#
# === 2. Push to Heroku
#
#   git push heroku main
#
# === 3. Run Database Migrations
#
#   heroku run rails db:migrate
#
# === 4. Verify Deployment
#
#   heroku open
#
# == Common Issues and Solutions
#
# === Asset Precompilation Failures
#
# * Ensure all asset-related gems are not in assets group
# * Check if all required node modules are installed
# * Verify production environment configuration
#
#   heroku run rails assets:precompile
#
# === Database Migration Errors
#
# * Check database.yml configuration
# * Verify environment variables
# * Review migration files for syntax errors
#
#   heroku run rails db:migrate:status
#
# === Application Crash on Startup
#
# * Check Heroku logs:
#     heroku logs --tail
# * Verify Procfile configuration
# * Check for missing environment variables
#
# == Best Practices
#
# === Security
#
# * Never commit sensitive credentials
# * Use environment variables for configuration
# * Regularly rotate database credentials
# * Enable Heroku SSL
#
# === Performance
#
# * Configure proper database pool size
# * Use worker dynos for background jobs
# * Enable rack-timeout
# * Configure caching appropriately
#
# === Monitoring
#
# * Set up Heroku application metrics
# * Configure error tracking (e.g., Sentry)
# * Enable Rails logging
# * Monitor database performance
#
# == Useful Heroku Commands
#
#   # View application logs
#   heroku logs --tail
#
#   # Run Rails console
#   heroku run rails console
#
#   # Check running processes
#   heroku ps
#
#   # Restart application
#   heroku restart
#
#   # Scale dynos
#   heroku ps:scale web=1
#
# == Production Checklist
#
# * [ ] Database backups configured
# * [ ] SSL certificate installed
# * [ ] Environment variables set
# * [ ] Asset precompilation successful
# * [ ] Background jobs configured
# * [ ] Error tracking enabled
# * [ ] Monitoring tools set up
# * [ ] Performance metrics enabled
#
# == Additional Resources
#
# * {Heroku Dev Center}[https://devcenter.heroku.com/categories/ruby]
# * {Rails Guides}[https://guides.rubyonrails.org/deploying_rails_applications.html]
# * {Heroku CLI Commands}[https://devcenter.heroku.com/articles/heroku-cli-commands]
#
# == Support and Troubleshooting
#
# For additional help:
#
# * Visit Heroku Status[https://status.heroku.com]
# * Check Heroku Dev Center[https://devcenter.heroku.com]
# * Stack Overflow tags: heroku, ruby-on-rails
#
# == Version Information
#
# Document Version: 1.0.0
# Last Updated: January 2025
# Tested with:
# * Ruby 3.2.2
# * Rails 7.1.0
# * Heroku Stack: heroku-22

Sample source code

```
# Gemfile
source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.2.2'

gem 'rails', '~> 7.1.0'
gem 'pg'
gem 'puma'
gem 'bootsnap'
gem 'redis'
gem 'sidekiq'
gem 'rack-timeout'

group :development, :test do
  gem 'debug'
  gem 'rspec-rails'
end

group :production do
  gem 'rack-canonical-host'
  gem 'scout_apm'
end

# config/puma.rb
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

worker_timeout 3600 if ENV.fetch("RAILS_ENV", "development") == "development"
port ENV.fetch("PORT") { 3000 }
environment ENV.fetch("RAILS_ENV") { "development" }
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }
workers ENV.fetch("WEB_CONCURRENCY") { 2 }
preload_app!

# config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: myapp_development

test:
  <<: *default
  database: myapp_test

production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
  prepared_statements: false
  advisory_locks: false

# Procfile
web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq -C config/sidekiq.yml

# config/environments/production.rb
Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?
  config.assets.compile = false
  config.active_storage.service = :amazon
  config.log_level = :info
  config.log_tags = [:request_id]
  config.force_ssl = true
  config.active_record.dump_schema_after_migration = false
end

# .env.sample (Do not commit actual .env file)
DATABASE_URL=postgres://username:password@localhost:5432/myapp
RAILS_MASTER_KEY=your_master_key_here
REDIS_URL=redis://localhost:6379/1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET=your_bucket_name
```
