---
layout: post
section-type: post
title: RuboCop Useful Tricks for Upgrading and Fixing One by One
category: ruby
tags: [ 'ruby', 'rubocop', 'linting' ]
comments: false
---

# RuboCop Useful Tricks for Upgrading and Fixing One by One

When upgrading RuboCop or applying it to an existing codebase, you're often faced with hundreds of offenses. Fixing them all at once is overwhelming. Here are the CLI tricks I discovered while upgrading—they help you tackle offenses systematically, one cop at a time.

---

## 1. `--format offenses` — See Where to Focus

The offenses formatter shows a summary of cop names and their offense counts, sorted by frequency. Use this first to understand where most of your cleanup effort will go.

```sh
$ rubocop --format offenses
```

**Example output:**

```
36 Layout/LineLength [Safe Correctable]
18 Style/StringLiterals [Safe Correctable]
13 Style/Documentation
10 Style/ExpandPathArguments [Safe Correctable]
8 Style/EmptyMethod [Safe Correctable]
6 Layout/IndentationConsistency [Safe Correctable]
4 Lint/SuppressedException
3 Layout/EmptyLinesAroundAccessModifier [Safe Correctable]
2 Layout/ExtraSpacing [Safe Correctable]
1 Style/ClassAndModuleChildren [Unsafe Correctable]
--
102 Total in 31 files
```

Each line shows: count, cop name, and whether it's safe/unsafe correctable. Start with high-count, safe-correctable cops to make quick progress.

---

## 2. `--only` — Fix One Cop at a Time

Run RuboCop for a single cop (or a few). Essential when upgrading: fix one cop, commit, move to the next.

```sh
# Single cop
$ rubocop --only Layout/LineLength

# Multiple cops (comma-separated, no spaces)
$ rubocop --only Layout/LineLength,Style/StringLiterals
```

**Example workflow:**

```sh
# 1. See offense summary
$ rubocop --format offenses

# 2. Pick a cop (e.g. Style/StringLiterals, 18 offenses)
$ rubocop --only Style/StringLiterals

# 3. Auto-correct if safe
$ rubocop --only Style/StringLiterals -a

# 4. Fix remaining manually, then commit
```

---

## 3. `--display-cop-names` / `-D` — Always Show Cop Names

By default, RuboCop shows cop names in offense messages. Use `--no-display-cop-names` to hide them when you want compact output. Use `-D` or `--display-cop-names` to ensure they're visible (helpful when output is truncated or you're piping).

```sh
# Explicitly show cop names (default)
$ rubocop -D

# Hide cop names for shorter output
$ rubocop --no-display-cop-names
```

**Example with `-D`:**

```
lib/foo.rb:6:5: C: Style/Documentation: Missing top-level class documentation comment.
class Foo
^^^^^
```

The cop name (`Style/Documentation`) is what you pass to `--only`, so seeing it in every offense is crucial when fixing incrementally.

---

## 4. `--format worst` — Find the Messiest Files

Similar to offenses, but ordered by file. Shows which files have the most violations.

```sh
$ rubocop --format worst
```

**Example output:**

```
89 app/models/legacy_order.rb
42 lib/legacy_parser.rb
12 spec/factories/users.rb
--
143 Total in 3 files
```

Useful when you want to clean up one file at a time instead of one cop at a time.

---

## 5. `--format files` — List Offending Files Only

Outputs only file paths with offenses. Handy for editors or scripts.

```sh
$ rubocop --format files
```

**Example:**

```sh
$ rubocop --format files | xargs vim
# Opens all offending files in Vim
```

---

## 6. Combine Formatters — Progress + Offenses

Use multiple formatters: progress for live feedback, offenses for the final summary.

```sh
$ rubocop --format progress --format offenses
```

You get the usual progress dots and a summary like:

```
..W.C....C..CWCW.C...WC.CC
Offenses:
...

36 Layout/LineLength [Safe Correctable]
18 Style/StringLiterals [Safe Correctable]
...
--
102 Total in 31 files
```

---

## 7. `--format simple` — Human-Readable Output

Cleaner, per-file layout when you don't need progress bars.

```sh
$ rubocop --format simple
```

**Example output:**

```
== lib/foo.rb ==
C:  6:  5: Style/Documentation: Missing top-level class documentation comment.
C: 12:  3: Layout/EmptyLinesAroundBlockBody: Extra empty line detected at block body end.
1 file inspected, 2 offenses detected
```

---

## 8. Auto-correct Options

**Safe auto-correct** (only equivalent changes):

```sh
$ rubocop -a
# or
$ rubocop --auto-correct
```

**All auto-correct** (including unsafe, may change semantics):

```sh
$ rubocop -A
# or
$ rubocop --auto-correct-all
```

**Combine with `--only`** for targeted fixes:

```sh
$ rubocop --only Layout/LineLength -a
```

Always run tests after using `-A`.

---

## 9. `--disable-uncorrectable` — Mark Unfixable Offenses

For offenses that can't be auto-corrected, add `rubocop:disable` comments so you can enforce the rest.

```sh
$ rubocop -a --disable-uncorrectable
```

Use sparingly; prefer fixing manually when feasible.

---

## 10. Redirect Output to Files

Send reports to files for CI or review:

```sh
# JSON for tooling
$ rubocop --format json --out rubocop.json

# HTML report
$ rubocop --format html -o rubocop.html

# Progress to stdout, offenses to file
$ rubocop --format progress --format offenses --out offenses.txt
```

---

## Suggested Upgrade Workflow

1. **Assess** — `rubocop --format offenses` to see cop counts.
2. **Prioritize** — Start with high-count, [Safe Correctable] cops.
3. **Fix in batches** — `rubocop --only CopName -a` for each cop.
4. **Verify** — Run tests after each batch.
5. **Commit** — Small, focused commits per cop or per file.
6. **Repeat** — Move to the next cop until satisfied.

---

## Quick Reference

| Option | Short | Description |
|--------|-------|-------------|
| `--only Cop/Name` | — | Run specific cop(s) only |
| `--format offenses` | `-f offenses` | Summary of offense counts by cop |
| `--format worst` | `-f worst` | Summary of offense counts by file |
| `--format files` | `-f files` | List files with offenses only |
| `--format simple` | `-f simple` | Human-readable output |
| `--display-cop-names` | `-D` | Show cop names in offenses |
| `--auto-correct` | `-a` | Safe auto-correct |
| `--auto-correct-all` | `-A` | All auto-correct |
| `--disable-uncorrectable` | — | Add disable comments for uncorrectable |
