---
layout: post
section-type: post
title: "Dozzle + Kamal: Live Docker Logs Across Multiple Hosts with Auth"
category: Development
tags: [ 'docker', 'kamal', 'dozzle', 'devops', 'deployment' ]
comments: true
---

[Dozzle](https://dozzle.dev) is a lightweight, real-time Docker log viewer with a clean web UI. Paired with [Kamal](https://kamal-deploy.org), you get a zero-fuss deployment pipeline for streaming live container logs across an entire fleet of Docker hosts — complete with TLS, authentication, and CI gating. This post walks through exactly how to set it up, including every gotcha we hit along the way.

## Architecture Overview

Dozzle has two deployment modes:

- **UI** — the web interface served over HTTPS, proxied by `kamal-proxy`
- **Agent** — a sidecar container running on each Docker host, speaking Dozzle's own mTLS on port `7007`

The UI connects to every agent and aggregates logs in real time. The two modes run from the **same Docker image** (`amir20/dozzle`); the agent is triggered simply by passing `cmd: agent` to Kamal.

```
Browser → HTTPS → dozzle.example.com (UI, kamal-proxy)
                         │
                         ├── :7007 → server1.example.com (agent)
                         ├── :7007 → server2.example.com (agent)
                         └── :7007 → server3.example.com (agent)
```

We keep them as two separate Kamal projects:

```
logs/
├── dozzle/           ← UI project
└── dozzle-agent/     ← Agent project (deploys to all app servers)
```

---

## Part 1: Dozzle Agent

### Dockerfile

The agent image is the upstream image unchanged:

```dockerfile
FROM amir20/dozzle:v8.14.7
```

### `config/deploy.yml`

```yaml
# Dozzle Agent — https://dozzle.dev/guide/agent
# Same image as dozzle UI; runs with `agent` cmd on each Docker host.
# Deploy: kamal setup | kamal deploy

service: dozzle-agent
image: yourorg/dozzle-agent

builder:
  arch: amd64

ssh:
  user: root

registry:
  server: ghcr.io
  username: yourorg
  password:
    - KAMAL_REGISTRY_PASSWORD

# One agent per Docker host. Add hosts as you roll agents out.
servers:
  web:
    hosts:
      - server1.example.com: server1
      - server2.example.com: server2
      - server3.example.com: server3
    # Same image as the UI; override CMD so the container runs agent mode.
    cmd: agent
    # Agents speak Dozzle's own TLS on 7007 — do not put kamal-proxy in front.
    proxy: false
    options:
      publish:
        - "7007:7007"

env:
  clear:
    DOZZLE_NO_ANALYTICS: "true"
  # Per-host display names shown in the Dozzle UI host picker.
  tags:
    server1:
      clear:
        DOZZLE_HOSTNAME: Server1
    server2:
      clear:
        DOZZLE_HOSTNAME: Server2
    server3:
      clear:
        DOZZLE_HOSTNAME: Server3

volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

> **Gotcha 1 — `cmd` placement in Kamal 2**
>
> Kamal 2 rejects `cmd` at the root of `deploy.yml`:
> ```
> ERROR (Kamal::ConfigurationError): unknown key: cmd
> ```
> It must live under the role (`servers.web`), not at the top level.

> **Gotcha 2 — Port 7007 already allocated on redeploy**
>
> Kamal boots the new container *before* stopping the old one. With `proxy: false` + `options.publish`, the old container still holds port `7007`, causing:
> ```
> Bind for 0.0.0.0:7007 failed: port is already allocated
> ```

### Fix: `pre-app-boot` hook

This hook stops the old agent containers on each host *before* Kamal tries to start the replacement:

```bash
# .kamal/hooks/pre-app-boot
#!/usr/bin/env bash
# Free host-published port 7007 before Kamal starts the replacement container.
set -euo pipefail

service="${KAMAL_SERVICE:?}"
hosts="${KAMAL_HOSTS:?}"

IFS=',' read -ra host_list <<< "$hosts"
for host in "${host_list[@]}"; do
  [ -z "$host" ] && continue
  echo "pre-app-boot: stopping ${service}-* on ${host} to free published ports"
  ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new "root@${host}" bash -s <<EOF
ids=\$(docker ps -q --filter "name=${service}-")
if [ -n "\$ids" ]; then
  docker stop \$ids
fi
EOF
done
```

Make it executable:

```bash
chmod +x .kamal/hooks/pre-app-boot
```

The filter is `name=dozzle-agent-` (from `KAMAL_SERVICE`). It only touches agent containers and leaves every other service — app servers, workers, databases — running.

---

## Part 2: Dozzle UI

### Dockerfile

The UI image bakes in `users.yml` as a fallback, though the runtime mount (see below) is the authoritative source:

```dockerfile
FROM amir20/dozzle:v8.14.7

# Optional fallback copy. Runtime auth uses the host bind-mount from
# deploy.yml (/etc/dozzle/users.yml → /data/users.yml), uploaded by
# .kamal/hooks/pre-deploy — a named volume on /data hides this layer.
COPY config/users.yml /data/users.yml
```

### `config/deploy.yml`

```yaml
# Dozzle UI — https://dozzle.dev
service: dozzle
image: yourorg/dozzle

builder:
  arch: amd64

ssh:
  user: root

registry:
  server: ghcr.io
  username: yourorg
  password:
    - KAMAL_REGISTRY_PASSWORD

servers:
  web:
    hosts:
      - dozzle.example.com

proxy:
  ssl: true
  host: dozzle.example.com
  app_port: 8080

env:
  clear:
    DOZZLE_AUTH_PROVIDER: simple
    # Session cookie lifetime (default is browser-session only).
    DOZZLE_AUTH_TTL: 48h
    # Comma-separated host:port — keep in sync with dozzle-agent servers.
    # Display names come from each agent's DOZZLE_HOSTNAME env var.
    DOZZLE_REMOTE_AGENT: "server1.example.com:7007,server2.example.com:7007,server3.example.com:7007"
    DOZZLE_NO_ANALYTICS: "true"

# Bind-mount users.yml from the host (uploaded by .kamal/hooks/pre-deploy).
# A bare named volume on /data hides image files, causing
# "No users.yaml or users.yml file found" on redeploy.
volumes:
  - dozzle-data:/data
  - /etc/dozzle/users.yml:/data/users.yml:ro
```

> **Gotcha 3 — YAML folded scalar appends a trailing newline**
>
> This innocent-looking YAML:
> ```yaml
> DOZZLE_REMOTE_AGENT: >
>   thorin.example.com:7007
> ```
> Makes Dozzle dial port `7007\n` — a completely wrong port string — because `>` (folded scalar) appends `\n`. Use a plain quoted string instead:
> ```yaml
> DOZZLE_REMOTE_AGENT: "server1.example.com:7007"
> ```

> **Gotcha 4 — `host:port|Name|Group` only works in Dozzle v10+**
>
> In Dozzle v8, the `|Name|Group` suffix is not parsed — the entire string including `|Server1|Production` is treated as the port, causing `unknown port`. Set the display name on each agent via `DOZZLE_HOSTNAME` instead.

---

## Part 3: Authentication

Kamal's `kamal-proxy` does not yet support `basic_auth` in `deploy.yml`. Use Dozzle's own **simple auth** provider, which reads a bcrypt `users.yml` file.

### Generating users

```bash
docker run -it --rm amir20/dozzle:v8.14.7 generate alice \
  --password 'a-strong-password' \
  --email alice@example.com \
  --name "Alice"
```

This prints a full `users:` block. Merge the new user into `config/users.yml`:

```yaml
users:
  admin:
    email: admin@example.com
    name: Admin
    password: $2a$11$...hash...
    filter: ""
    roles: ""

  alice:
    email: alice@example.com
    name: Alice
    password: $2a$11$...hash...
    filter: ""
    roles: ""
```

Optional per-user fields:
- `filter` — limit visible containers (e.g. `label=app=server1`)
- `roles` — `shell`, `actions`, `download`, `none`, or `all` (empty = all)

Passwords are **bcrypt hashes**, not plaintext. The file is safe to commit to a private repository; just use a strong password since hashes can be brute-forced offline if weak.

> **Gotcha 5 — Named volume hides baked-in `users.yml`**
>
> If a named volume is mounted over `/data`, Docker applies it *on top of* the image layer — the `COPY config/users.yml /data/users.yml` in the Dockerfile is invisible at runtime. Dozzle crashes with:
> ```
> fatal: No users.yaml or users.yml file found.
> ```
> The fix is a **bind-mount** that explicitly places the file, combined with a `pre-deploy` hook that uploads it to the host first.

### Fix: `pre-deploy` hook

```bash
# .kamal/hooks/pre-deploy
#!/usr/bin/env bash
# Upload users.yml so it can be bind-mounted over /data/users.yml.
set -euo pipefail

users_yml="./config/users.yml"
if [ ! -f "$users_yml" ]; then
  echo "pre-deploy: missing ${users_yml} (run from the dozzle app root)" >&2
  exit 1
fi

hosts="${KAMAL_HOSTS:?}"
IFS=',' read -ra host_list <<< "$hosts"
for host in "${host_list[@]}"; do
  [ -z "$host" ] && continue
  echo "pre-deploy: uploading users.yml to ${host}:/etc/dozzle/users.yml"
  ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new "root@${host}" "mkdir -p /etc/dozzle"
  scp -o BatchMode=yes -o StrictHostKeyChecking=accept-new \
    "$users_yml" "root@${host}:/etc/dozzle/users.yml"
done
```

```bash
chmod +x .kamal/hooks/pre-deploy
```

And in `deploy.yml`, the volume mounts look like:

```yaml
volumes:
  - dozzle-data:/data
  - /etc/dozzle/users.yml:/data/users.yml:ro
```

---

## Part 4: Project Structure

### `dozzle` (UI)

```
dozzle/
├── Dockerfile
├── .dockerignore
├── config/
│   ├── deploy.yml
│   ├── users.yml           # bcrypt users (safe to commit)
│   └── users.yml.example
├── .kamal/
│   ├── secrets             # gitignored — KAMAL_REGISTRY_PASSWORD
│   ├── secrets.example
│   └── hooks/
│       └── pre-deploy      # uploads users.yml to host before build
└── .github/
    └── CODEOWNERS
```

### `dozzle-agent` (Agent)

```
dozzle-agent/
├── Dockerfile
├── .dockerignore
├── config/
│   └── deploy.yml
├── .kamal/
│   ├── secrets
│   ├── secrets.example
│   └── hooks/
│       └── pre-app-boot    # stops old agent to free port 7007
└── .github/
    └── CODEOWNERS
```

---

## Part 5: Deploy Order

Always deploy the agents first so the UI can reach them when it comes up:

```bash
# 1. Deploy agents to all Docker hosts
cd dozzle-agent
kamal setup   # first time only
kamal deploy

# 2. Deploy the UI
cd ../dozzle
kamal setup   # first time only
kamal deploy
```

To update `users.yml` without a code change:

```bash
cd dozzle
docker run -it --rm amir20/dozzle:v8.14.7 generate bob \
  --password 'bobs-password' \
  --email bob@example.com \
  --name "Bob"
# Paste the generated block into config/users.yml under `users:`
git add config/users.yml
git commit -m "Add Dozzle user bob"
git push
# CI / kamal deploy will re-upload users.yml and redeploy
```

---

## Part 6: CI with Semaphore (deploy on `main` only)

Restrict the deploy pipeline to `main` so feature branches don't accidentally ship:

```yaml
# .semaphore/semaphore.yml (both repos)
blocks:
  - name: "🏁 Deploy"
    run:
      when: "branch = 'main'"
    task:
      jobs:
        - name: Deploy
          commands:
            - kamal deploy
```

Other branches still run tests; they just skip the deploy job.

---

## Gotcha Summary

| # | Symptom | Root cause | Fix |
|---|---------|------------|-----|
| 1 | `ConfigurationError: unknown key: cmd` | `cmd` at root, not under role | Move under `servers.web` |
| 2 | `Bind for 0.0.0.0:7007 failed: port is already allocated` | Kamal starts new container before stopping old | `pre-app-boot` hook to stop old agent |
| 3 | `unknown port` — port is `7007\n` | YAML `>` folded scalar adds trailing newline | Use quoted string for `DOZZLE_REMOTE_AGENT` |
| 4 | `unknown port` — port is `7007\|Server1\|Production` | `\|Name\|Group` syntax needs Dozzle v10+; you're on v8 | Strip label suffix; use `DOZZLE_HOSTNAME` on agent |
| 5 | `fatal: No users.yaml or users.yml file found` | Named volume on `/data` hides the `COPY`'d file | `pre-deploy` hook + explicit bind-mount |

---

## Conclusion

Dozzle gives you a beautiful, real-time log viewer across an entire Docker fleet. With Kamal you get TLS, zero-downtime deploys, and per-environment CI gating — all from a few lines of YAML.

The trickiest parts are the volume/auth interaction and the port-binding race on redeploy. Once you have the `pre-deploy` and `pre-app-boot` hooks in place, the whole setup is completely hands-off.

The full config is two small Kamal projects — under 50 lines of YAML each — which is a good reminder that operations tooling doesn't have to be complex.
