---
layout: post
section-type: post
title: "Git Worktrees: Let AI Work While You Work"
category: Development
tags: [ 'git', 'productivity', 'ai', 'developer-tools', 'cli' ]
comments: true
---

With AI coding assistants like Claude, Gemini CLI, or Copilot becoming daily drivers, a new workflow problem has emerged: **how do you let the AI grind away on a feature while you keep coding on something else — without them stepping on each other?**

The answer is `git worktree`.

## What is a Git Worktree?

A **worktree** lets you check out multiple branches of the same repository simultaneously in different directories — sharing the same `.git` folder and object store.

Unlike cloning the repo again, worktrees are:
- **Lightweight** — no duplication of the Git history or objects
- **Branch-aware** — each worktree is on its own branch, preventing conflicts
- **Fast** — same pack files, same object database

```sh
# Basic anatomy
.git/                    ← shared Git database
my-project/              ← your main working tree (default)
my-project-feature-x/   ← worktree for a feature branch
my-project-ai-task/      ← worktree for AI to work in
```

## The AI-Assisted Development Use Case

Here's the scenario that makes worktrees invaluable today:

> You want Claude (or any AI CLI) to implement a new feature on its own branch, running tests and iterating — while you continue working on a bug fix or a different feature in the main working tree, without interference.

Without worktrees, you'd either:
- Stash your work and context-switch constantly
- Clone the repo a second time (messy, duplicated history)
- Block yourself waiting for the AI to finish

With worktrees, both you and the AI operate independently, simultaneously, on the same codebase.

## Setting Up Worktrees

### Create a worktree for the AI to work in

```sh
# Create a new branch and worktree in one command
git worktree add ../my-project-ai-task -b feature/ai-new-payment-flow

# Or use an existing branch
git worktree add ../my-project-ai-task feature/ai-new-payment-flow
```

### List all active worktrees

```sh
git worktree list
```

```
/Users/you/my-project             abc1234 [main]
/Users/you/my-project-ai-task     def5678 [feature/ai-new-payment-flow]
```

### Remove a worktree when done

```sh
git worktree remove ../my-project-ai-task

# If the worktree has uncommitted changes, force remove
git worktree remove --force ../my-project-ai-task
```

## The Missing Piece: Gitignored Files

Here's the catch that trips everyone up. Your `.gitignore` intentionally excludes files the project still *needs* to run — things like:

- `.env` / `.env.local` — environment variables, API keys
- `config/master.key` — Rails credentials key
- `config/database.yml` — local DB config
- `node_modules/` — (you may want to copy some local overrides)
- `.tool-versions` / `.ruby-version` — local version pins

When you create a fresh worktree, it starts clean — without any of those files. The AI's terminal will fail immediately with missing credentials, wrong database config, or broken environment.

### Copy gitignored files to the worktree

This command copies all locally-present gitignored files (excluding noisy build/cache directories) from your main tree into the new worktree:

```sh
git ls-files --others --ignored --exclude-standard \
  | grep -vE '^(tmp|log|node_modules|vendor/bundle|storage|coverage)/' \
  | rsync -av --files-from=- ./ ../my-project-ai-task/
```

**Breaking it down:**

| Part | What it does |
|------|--------------|
| `git ls-files --others --ignored --exclude-standard` | Lists all gitignored files present on disk |
| `grep -vE '^(tmp\|log\|node_modules\|...'` | Strips out generated/cache directories you don't want to copy |
| `rsync -av --files-from=- ./ ../my-project-ai-task/` | Copies only those files, preserving directory structure |

Adjust the `grep -vE` pattern to match your project's build artifacts. For a Ruby on Rails app you might exclude `tmp`, `log`, `storage`, `vendor/bundle`, `coverage`. For a Node project, swap in `dist`, `build`, `.next`.

### Make it a shell alias

```sh
# In ~/.zshrc or ~/.bashrc
worktree-sync() {
  local target=${1:?Usage: worktree-sync <target-worktree-path>}
  git ls-files --others --ignored --exclude-standard \
    | grep -vE '^(tmp|log|node_modules|vendor/bundle|storage|coverage|dist|build)/' \
    | rsync -av --files-from=- ./ "$target"/
}
```

Then use it as:

```sh
worktree-sync ../my-project-ai-task
```

## Full Workflow Example

Here's the complete flow — two terminals, two streams of work:

**Terminal 1 — your work:**

```sh
cd ~/my-project
git checkout -b fix/payment-bug

# ... edit files, run tests, iterate normally
```

**Terminal 2 — AI's workspace:**

```sh
# 1. Create the worktree
git worktree add ../my-project-ai-task -b feature/new-payment-flow

# 2. Sync gitignored runtime files
git ls-files --others --ignored --exclude-standard \
  | grep -vE '^(tmp|log|node_modules|vendor/bundle|storage|coverage)/' \
  | rsync -av --files-from=- ./ ../my-project-ai-task/

# 3. Switch into the AI's workspace and launch the AI
cd ../my-project-ai-task
claude "Implement the new Stripe payment flow as described in JIRA-123.
        Run the test suite after each change and fix any failures."
```

Both terminals are now live, independent, and non-blocking.

## Merging the AI's Work Back

Once the AI finishes, review and merge normally:

```sh
# From your main working tree
cd ~/my-project

git fetch . feature/new-payment-flow   # fetch from the local worktree branch
git merge feature/new-payment-flow     # or open a PR if you prefer review first

# Or review the diff first
git diff main..feature/new-payment-flow
```

## Tips and Gotchas

**1. Never check out the same branch in two worktrees.**
Git enforces this. You'll get an error like `fatal: 'main' is already checked out`. Each worktree must be on a unique branch.

**2. Long-running processes (Rails server, webpack dev server) need separate ports.**
If you spin up servers in both worktrees, bind them to different ports:

```sh
# In my-project
rails s -p 3000

# In my-project-ai-task
rails s -p 3001
```

**3. Re-sync gitignored files if your `.env` changes.**
The worktree gets a snapshot copy. If you rotate credentials or update config in the main tree, re-run the `rsync` command to refresh the worktree.

**4. Clean up when done.**
Abandoned worktrees accumulate on disk. Run `git worktree list` periodically and prune stale ones:

```sh
git worktree prune   # removes refs to worktrees whose directories no longer exist
```

**5. Node modules: symlink instead of copy.**
For large `node_modules` you might prefer a symlink over copying:

```sh
ln -s "$(pwd)/node_modules" ../my-project-ai-task/node_modules
```

## Why This Beats Just Cloning Again

| | `git worktree` | Second clone |
|---|---|---|
| Disk usage | Shared object store | Full duplication |
| `git fetch` | One fetch updates all trees | Must fetch in each clone |
| Branch isolation | Enforced by Git | Manual, easy to mix up |
| Setup time | Seconds | Proportional to repo size |
| Pushing branches | Normal `git push` | Same, but disconnected |

## Conclusion

Git worktrees aren't new, but they've found a second life in the age of AI-assisted coding. The pattern of **human + AI working in parallel on the same repo, each on their own branch, each in their own directory** is quickly becoming the standard development flow.

The two commands worth memorising:

```sh
# Spin up a new AI workspace
git worktree add ../my-project-ai-task -b feature/your-task-name

# Populate it with runtime secrets and config
git ls-files --others --ignored --exclude-standard \
  | grep -vE '^(tmp|log|node_modules|vendor/bundle|storage|coverage)/' \
  | rsync -av --files-from=- ./ ../my-project-ai-task/
```

From there, hand off the task to your AI of choice and get back to your own work. Two brains, two branches, zero conflicts.
