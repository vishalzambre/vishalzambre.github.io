---
layout: post
section-type: post
title: Deploying Rails Applications to Heroku
category: rails
tags:  [ 'ruby', 'heroku', 'rails', 'devops' ]
comments: false
---

# Deploying Rails Applications to Heroku
## A Practical Guide for Students

### 1. Introduction
- What is Heroku?
  - Cloud platform as a service (PaaS)
  - Perfect for student projects and startups
  - Free tier available for learning and small applications

### 2. Prerequisites
- Git installed and configured
- Ruby and Rails installed locally
- Basic understanding of command line operations
- Heroku CLI installed
- A Rails application ready to deploy

### 3. Setting Up Your Rails Application
#### Database Configuration
- Switch from SQLite to PostgreSQL
- Update your Gemfile
- Configure database.yml
- Set up environment variables

#### Version Control
- Initialize Git repository
- Create .gitignore file
- Make initial commit

### 4. Heroku Setup Steps
1. Create Heroku Account
   - Visit heroku.com
   - Sign up with student email
   - Verify account

2. Install Heroku CLI
   ```bash
   # For macOS
   brew install heroku/brew/heroku

   # For Windows
   # Download installer from Heroku website
   ```

3. Login to Heroku
   ```bash
   heroku login
   ```

### 5. Deployment Process
1. Create Heroku Application
   ```bash
   heroku create your-app-name
   ```

2. Configure Environment
   ```bash
   heroku config:set RAILS_ENV=production
   heroku config:set RAILS_MASTER_KEY=<your-master-key>
   ```

3. Deploy Application
   ```bash
   git push heroku main
   ```

4. Database Setup
   ```bash
   heroku run rails db:migrate
   ```

### 6. Common Issues and Solutions
- Asset compilation failures
- Database migration errors
- Environment variable misconfigurations
- Ruby version mismatches

### 7. Best Practices
- Always test locally before deploying
- Use environment variables for sensitive data
- Keep your master key secure
- Regular backups of production database
- Monitor application logs

### 8. Monitoring and Maintenance
- Viewing logs: `heroku logs --tail`
- Checking app status: `heroku ps`
- Scaling your application
- Database management

### 9. Additional Resources
- Heroku Dev Center documentation
- Rails Guides on deployment
- Community forums and support
- Video tutorials and workshops

### 10. Demo Time!
Let's walk through a live deployment...

```
# Create a new Rails application
rails new heroku-demo --database=postgresql

# Navigate to the application directory
cd heroku-demo

# Update Gemfile
# Add these lines to your Gemfile
source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.2.2'

gem 'rails', '~> 7.1.0'
gem 'pg'
gem 'puma'
gem 'bootsnap'
gem 'tzinfo-data'

group :development, :test do
  gem 'debug'
end

group :development do
  gem 'web-console'
end

# Create a simple welcome controller
rails generate controller Welcome index

# Add route to config/routes.rb
Rails.application.routes.draw do
  root 'welcome#index'
end

# Create app/views/welcome/index.html.erb
# Add this content:
<h1>Welcome to Our Demo App!</h1>
<p>This application is deployed on Heroku</p>
<p>Server time: <%= Time.current %></p>

# Database configuration (config/database.yml)
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: heroku_demo_development

test:
  <<: *default
  database: heroku_demo_test

production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>

# Initialize Git repository
git init
git add .
git commit -m "Initial commit"

# Create Heroku app and deploy
heroku create heroku-demo-app
git push heroku main
heroku run rails db:migrate
```
