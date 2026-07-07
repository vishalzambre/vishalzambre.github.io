---
layout: post
section-type: post
title: GitHub Filtering & Searching - Issues and Pull Requests Cheatsheet
category: Development
tags: [ 'github', 'productivity', 'developer-tools', 'cheatsheet' ]
comments: true
---

GitHub's search and filter capabilities are incredibly powerful, but many of the most useful filters aren't visible in the UI. Here's a cheatsheet of advanced filters that will supercharge your workflow, especially when managing Pull Requests and Issues.

## Pull Request Filters - The Hidden Gems

### Review Status Filters

These are some of the most useful filters that don't appear in the GitHub UI dropdowns:

```
# PRs awaiting YOUR review
is:pr is:open review-requested:@me

# PRs where YOU are specifically requested (not just team mentions)
is:pr is:open user-review-requested:@me

# PRs you've already reviewed
is:pr is:open reviewed-by:@me

# PRs awaiting review from a specific person
is:pr is:open review-requested:username

# PRs with no reviews yet
is:pr is:open review:none

# PRs that have been approved
is:pr is:open review:approved

# PRs with changes requested
is:pr is:open review:changes_requested

# PRs that require review (not yet approved)
is:pr is:open review:required
```

### Author and Assignment Filters

```
# Your open PRs
is:pr is:open author:@me

# PRs you're assigned to
is:pr is:open assignee:@me

# PRs with no assignee
is:pr is:open no:assignee

# Draft PRs (hidden work in progress)
is:pr is:open draft:true

# Ready PRs only (exclude drafts)
is:pr is:open draft:false
```

### Team and Organization Filters

```
# PRs where your team is requested for review
is:pr is:open team-review-requested:org/team-name

# PRs in a specific org
is:pr is:open org:organization-name

# PRs across all repos you have access to in an org
is:pr is:open user:organization-name
```

### Advanced PR Filters

```
# PRs without specific labels
is:pr is:open -label:"do not merge"

# PRs by date range
is:pr created:>2026-01-01

# PRs updated recently
is:pr is:open updated:>2026-07-01

# PRs with merge conflicts
is:pr is:open status:failure

# PRs that passed CI
is:pr is:open status:success

# PRs in specific branch
is:pr is:open base:main

# PRs from specific branch
is:pr is:open head:feature-branch
```

## Issue Filters

### Basic but Powerful

```
# Issues assigned to you
is:issue is:open assignee:@me

# Issues you created
is:issue is:open author:@me

# Issues mentioning you
is:issue is:open mentions:@me

# Issues with no assignee (grab one!)
is:issue is:open no:assignee

# Issues with no labels
is:issue is:open no:label

# Issues with no milestone
is:issue is:open no:milestone
```

### Issue Status and Type

```
# Issues without any linked PRs
is:issue is:open no:pr

# Issues that have linked PRs
is:issue is:open linked:pr

# Issues with specific labels
is:issue is:open label:bug label:high-priority

# Issues without specific labels
is:issue is:open -label:wontfix

# Closed issues with reason
is:issue is:closed reason:completed
is:issue is:closed reason:"not planned"
```

## Combining Filters - Real World Examples

Here are some powerful combinations I use daily:

### 1. My Action Items

```
# Everything needing my attention today
is:open (review-requested:@me OR assignee:@me)
```

### 2. Team Dashboard

```
# All open work for the team
is:open org:mycompany assignee:@me sort:updated-desc
```

### 3. Stale PR Cleanup

```
# Old PRs that need attention
is:pr is:open updated:<2026-06-01 -label:blocked
```

### 4. Ready to Merge

```
# Approved PRs ready to ship
is:pr is:open review:approved status:success -label:"do not merge"
```

### 5. Help Wanted

```
# Good issues for new contributors
is:issue is:open label:"good first issue" no:assignee
```

### 6. My PRs Awaiting Others

```
# PRs I authored waiting for review
is:pr is:open author:@me review:required
```

## Pro Tips

### 1. Save Your Searches
GitHub allows you to save custom searches. Click "Save" after building a complex filter to access it quickly later.

### 2. Use Keyboard Shortcuts
- Press `/` to focus on the search bar
- Press `?` to see all keyboard shortcuts

### 3. Sort Results
Add `sort:` qualifiers to your searches:
- `sort:updated-desc` - Recently updated
- `sort:created-desc` - Recently created
- `sort:comments-desc` - Most discussed
- `sort:interactions-desc` - Most active

### 4. Date Ranges
Use relative dates for flexible searches:
- `created:>2026-01-01` - After specific date
- `updated:<2026-07-01` - Before specific date
- `merged:2026-01-01..2026-07-01` - Date range

### 5. Exclude Archived Repositories
```
is:pr is:open archived:false
```

### 6. Search Within Repository
Navigate to a specific repository and then use these filters in the search bar - they'll automatically scope to that repo.

## Quick Reference Table

| Filter | Description |
|--------|-------------|
| `review-requested:@me` | PRs awaiting your review |
| `user-review-requested:@me` | PRs where you're directly requested |
| `reviewed-by:@me` | PRs you've reviewed |
| `review:none` | PRs with no reviews |
| `review:approved` | Approved PRs |
| `review:changes_requested` | PRs needing changes |
| `draft:true` | Draft PRs |
| `no:assignee` | Unassigned items |
| `no:label` | Unlabeled items |
| `linked:pr` | Issues with linked PRs |
| `status:success` | PRs that passed CI |
| `archived:false` | Exclude archived repos |

## Bookmarks I Actually Use

Here are the filtered views I have bookmarked and check daily:

1. **My Review Queue**: `is:pr is:open review-requested:@me archived:false`
2. **My Open PRs**: `is:pr is:open author:@me archived:false`
3. **Approved & Ready**: `is:pr is:open review:approved status:success author:@me`
4. **My Issues**: `is:issue is:open assignee:@me archived:false sort:updated-desc`
5. **Help Wanted**: `is:issue is:open label:"good first issue" no:assignee`

## Conclusion

These filters transform GitHub from a simple repository host into a powerful workflow management tool. The key is finding the 3-5 searches that match your daily workflow and bookmarking them.

Most developers don't know about `review-requested:@me` or `user-review-requested:@me`, which means they're constantly hunting through notifications or repository tabs. Save yourself time and mental energy by using these filters.

What filters do you use most often? Let me know in the comments!