---
layout: post
section-type: post
title: Github CLI to create PR gh Using Commit and Jira reference as Body
category: git
tags: [ 'git', 'tech', 'devops' ]
comments: false
---

# Creating Pull Requests with Jira References Using GitHub CLI

Managing pull requests in development workflows often requires linking them to Jira tickets and including relevant commit information. Manually creating PRs with formatted bodies containing Jira links and commit details can be time-consuming and error-prone. In this post, I'll demonstrate how to automate this process using GitHub CLI (`gh`) with a custom shell function.

## The Problem

When creating pull requests, developers typically need to:
- Reference relevant Jira tickets
- Include commit messages for context
- Add reviewers and assignees
- Apply appropriate labels
- Format everything consistently

Doing this manually for every PR is inefficient and can lead to inconsistent formatting or missed information.

## The Solution

Here's a shell function that automates the entire process:

```bash
create_pr_with_jira() {
  local base_branch="$1"
  local pr_title="$2"
  local current_branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)

  if [[ -z "$base_branch" || -z "$pr_title" ]]; then
    echo "Usage: create_pr_with_jira <base_branch> <pr_title>"
    return 1
  fi

  local jira_domain="example.atlassian.net"  # Replace with your actual Jira domain

  local jira_section=$(git log origin/"$base_branch"..HEAD --pretty=format:'%s' | \
    grep -Eo '([A-Z]+-[0-9]+)' | sort -u | \
    awk -v domain="$jira_domain" '{ print "- [" $0 "](https://" domain "/browse/" $0 ")" }')

  local commit_section=$(git log origin/"$base_branch"..HEAD --pretty=format:'- %s')

  local pr_body="### Jira Tickets:
  $jira_section

  ### Commits:
  $commit_section"

  gh pr create --base "$base_branch" --head "$current_branch" --title "$pr_title" --body "$pr_body" \
    --reviewer github/review-team --assignee @me --add-label "trigger-ci"
}
```

## Code Breakdown

Let's examine each part of this function:

### 1. Parameter Validation
```bash
local base_branch="$1"
local pr_title="$2"
local current_branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [[ -z "$base_branch" || -z "$pr_title" ]]; then
  echo "Usage: create_pr_with_jira <base_branch> <pr_title>"
  return 1
fi
```

The function accepts two required parameters:
- `base_branch`: The target branch for the PR (e.g., `main`, `develop`)
- `pr_title`: The title for the pull request

It also gets the current branch name using `git rev-parse --abbrev-ref HEAD`.

### 2. Jira Ticket Extraction
```bash
local jira_domain="example.atlassian.net"  # Replace with your actual Jira domain

local jira_section=$(git log origin/"$base_branch"..HEAD --pretty=format:'%s' | \
  grep -Eo '([A-Z]+-[0-9]+)' | sort -u | \
  awk -v domain="$jira_domain" '{ print "- [" $0 "](https://" domain "/browse/" $0 ")" }')
```

This section:
- Uses `git log` to get commit messages between the base branch and current branch
- Extracts Jira ticket references using regex pattern `([A-Z]+-[0-9]+)` (e.g., `ABC-123`)
- Removes duplicates with `sort -u`
- Formats each ticket as a markdown link using `awk`

### 3. Commit Message Collection
```bash
local commit_section=$(git log origin/"$base_branch"..HEAD --pretty=format:'- %s')
```

This creates a bulleted list of all commit messages between the base branch and current branch.

### 4. PR Body Formation
```bash
local pr_body="### Jira Tickets:
$jira_section

### Commits:
$commit_section"
```

The function creates a structured PR body with two sections:
- **Jira Tickets**: Clickable links to related Jira issues
- **Commits**: List of commit messages for context

### 5. PR Creation
```bash
gh pr create --base "$base_branch" --head "$current_branch" --title "$pr_title" --body "$pr_body" \
  --reviewer github/review-team --assignee @me --add-label "trigger-ci"
```

Finally, it uses GitHub CLI to create the PR with:
- Base and head branches
- Title and formatted body
- Reviewers and assignees
- Labels for automated workflows

## Usage Examples

### Basic Usage
```bash
# Create a PR from current branch to main
create_pr_with_jira main "Add user authentication feature"
```

### Different Base Branches
```bash
# Create PR to develop branch
create_pr_with_jira develop "Fix payment processing bug"

# Create PR to a feature branch
create_pr_with_jira feature/new-dashboard "Update dashboard components"
```

### Example Output

If your commits include references like `ABC-123` and `XYZ-456`, the generated PR body will look like:

```markdown
### Jira Tickets:
- [ABC-123](https://example.atlassian.net/browse/ABC-123)
- [XYZ-456](https://example.atlassian.net/browse/XYZ-456)

### Commits:
- ABC-123: Add user authentication middleware
- XYZ-456: Fix payment validation logic
- Update tests for authentication flow
```

## Prerequisites

Before using this function, ensure you have:

1. **GitHub CLI installed**: Install with `brew install gh` (macOS) or visit [GitHub CLI installation guide](https://cli.github.com/manual/installation)
2. **GitHub CLI authenticated**: Run `gh auth login` and follow the prompts
3. **Git repository**: The function should be run from within a git repository
4. **Jira domain configured**: Update the `jira_domain` variable with your organization's Jira URL

## Customization Options

You can customize the function for your workflow:

### Change Jira Domain
```bash
local jira_domain="your-company.atlassian.net"
```

### Modify Reviewers and Labels
```bash
gh pr create --base "$base_branch" --head "$current_branch" --title "$pr_title" --body "$pr_body" \
  --reviewer your-team/reviewers --assignee @me --add-label "feature, ready-for-review"
```

### Different Jira Ticket Pattern
If your Jira tickets follow a different pattern, modify the regex:
```bash
# For tickets like PROJ-123
grep -Eo '([A-Z]+-[0-9]+)'

# For tickets like proj-123 (lowercase)
grep -Eo '([a-z]+-[0-9]+)'
```

## Benefits

This automated approach provides several advantages:

1. **Consistency**: Every PR follows the same format
2. **Time-saving**: No manual copying of commit messages or Jira links
3. **Traceability**: Clear connection between PRs, commits, and Jira tickets
4. **Automation**: Automatically adds reviewers and labels
5. **Error reduction**: Eliminates manual formatting mistakes

## Integration with Shell Profile

To use this function persistently, add it to your shell profile:

```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'create_pr_with_jira() { ... }' >> ~/.zshrc
source ~/.zshrc
```

## Conclusion

Automating pull request creation with Jira references using GitHub CLI significantly improves development workflow efficiency. This function ensures consistent PR formatting, saves time, and maintains clear traceability between code changes and project management tickets.

The combination of Git's powerful log commands, regex pattern matching, and GitHub CLI's comprehensive PR creation capabilities makes this automation both robust and flexible for various development workflows.

Try implementing this function in your development workflow and customize it according to your team's specific needs!
