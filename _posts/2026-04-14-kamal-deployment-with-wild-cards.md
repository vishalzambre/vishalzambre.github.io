---
layout: post
section-type: post
title: Kamal Deployment with Custom SSL for Staging and Production
category: DevOps
tags: [ 'kamal', 'docker', 'deployment', 'ssl', 'staging', 'production' ]
comments: true
---

Kamal is a great way to deploy containerized applications to your own servers without maintaining a full Kubernetes setup. In this guide, you will set up a complete `staging` and `production` deployment flow with custom SSL certificates and clear environment separation.

## What you will build

- One codebase
- Two environments: `staging` and `production`
- Separate servers per environment
- Environment-specific secrets and runtime variables
- Custom SSL certificates managed by you

## Prerequisites

Before starting, make sure you have:

1. A Rails (or any Dockerized) app ready to run in production mode
2. Two domains (example):
   - `app-staging.example.com`
   - `app.example.com`
3. SSH access to both servers
4. Docker installed on both servers
5. Kamal installed locally

Install Kamal if needed:

```bash
gem install kamal
```

## Step 1: Initialize Kamal

From your project root:

```bash
kamal init
```

This creates:

- `config/deploy.yml`
- `.kamal/secrets`

## Step 2: Define shared and environment-specific deploy config

Use one base config and two environment overlay files.

### `config/deploy.yml` (base)

```yaml
service: myapp
image: your-dockerhub-user/myapp

registry:
  username: your-dockerhub-user
  password:
    - KAMAL_REGISTRY_PASSWORD

ssh:
  user: deploy

builder:
  arch: amd64

proxy:
  app_port: 3000
  ssl: false
```

### `config/deploy.staging.yml`

```yaml
servers:
  web:
    hosts:
      - 10.0.1.10

env:
  clear:
    RAILS_ENV: staging
    RACK_ENV: staging
    APP_HOST: app-staging.example.com
  secret:
    - RAILS_MASTER_KEY
    - DATABASE_URL
    - SECRET_KEY_BASE
```

### `config/deploy.production.yml`

```yaml
servers:
  web:
    hosts:
      - 10.0.2.10

env:
  clear:
    RAILS_ENV: production
    RACK_ENV: production
    APP_HOST: app.example.com
  secret:
    - RAILS_MASTER_KEY
    - DATABASE_URL
    - SECRET_KEY_BASE
```

## Step 3: Add environment secrets

Store all secrets in `.kamal/secrets`:

```dotenv
KAMAL_REGISTRY_PASSWORD=...

# staging
STAGING_RAILS_MASTER_KEY=...
STAGING_DATABASE_URL=...
STAGING_SECRET_KEY_BASE=...

# production
PRODUCTION_RAILS_MASTER_KEY=...
PRODUCTION_DATABASE_URL=...
PRODUCTION_SECRET_KEY_BASE=...
```

Map env-specific values when deploying:

- For staging, export secrets from `STAGING_*`
- For production, export secrets from `PRODUCTION_*`

One simple pattern is a tiny shell wrapper per environment.

## Step 4: Configure custom SSL certificate files

If you manage certs manually (for example from your CA or internal PKI), keep them outside your repo:

```bash
mkdir -p ~/.ssl/myapp
```

Place files like:

- `~/.ssl/myapp/staging.crt`
- `~/.ssl/myapp/staging.key`
- `~/.ssl/myapp/production.crt`
- `~/.ssl/myapp/production.key`

Then extend each environment config with proxy SSL mounts.

### Add to `config/deploy.staging.yml`

```yaml
proxy:
  host: app-staging.example.com"
  ssl:
    certificate_pem: /home/deploy/.ssl/myapp/staging.crt
    private_key_pem: /home/deploy/.ssl/myapp/staging.key
```

### Add to `config/deploy.production.yml`

```yaml
proxy:
  hosts:
    - "app.example.com"
    - "*.example.com"
  ssl:
    certificate_pem: /home/deploy/.ssl/myapp/production.crt
    private_key_pem: /home/deploy/.ssl/myapp/production.key
```

> Make sure the cert and key are copied to each target server at the same absolute path and readable by the deploy user.

## Step 5: Set DNS records (wildcard or explicit hosts)

You can use explicit host records or wildcard DNS:

- Explicit:
  - `app-staging.example.com -> staging server IP`
  - `app.example.com -> production server IP`
- Wildcard approach:
  - `*.staging.example.com -> staging server IP`
  - `*.example.com -> production server IP`

If you use wildcard DNS, ensure your SSL certificate SAN/CN matches the hostnames.

## Step 6: First-time server preparation

Run setup for each environment:

```bash
kamal setup -c config/deploy.yml -d staging
kamal setup -c config/deploy.yml -d production
```

If your Kamal version expects direct config files, use:

```bash
kamal setup -c config/deploy.staging.yml
kamal setup -c config/deploy.production.yml
```

## Step 7: Deploy to staging, then production

Deploy to staging first:

```bash
kamal deploy -c config/deploy.staging.yml
```

Verify application and SSL:

```bash
curl -I https://app-staging.example.com
```

When staging is healthy, deploy production:

```bash
kamal deploy -c config/deploy.production.yml
```

Verify production:

```bash
curl -I https://app.example.com
```

## Step 8: Safe release workflow

Recommended process:

1. Merge to `main`
2. Deploy `staging`
3. Run smoke tests
4. Deploy `production`
5. Monitor logs and health endpoints

Useful commands:

```bash
kamal app logs -c config/deploy.staging.yml
kamal app logs -c config/deploy.production.yml
```

## Common issues and fixes

- SSL handshake fails
  - Check key/cert pair match
  - Check cert chain includes intermediate CA
  - Check file permissions on server
- Wrong environment variables loaded
  - Confirm `env.clear` and `env.secret` in the active deploy config
  - Avoid reusing production secrets in staging
- 502/Bad Gateway from proxy
  - Confirm `app_port` matches container app port
  - Confirm app process is listening on `0.0.0.0`

## Final notes

This setup gives you a clean and scalable deployment model:

- predictable environment isolation
- controlled custom SSL management
- safer release lifecycle through staging-first deployments

Once this is stable, your next improvement is adding automated health checks and CI-triggered staging deploys.
