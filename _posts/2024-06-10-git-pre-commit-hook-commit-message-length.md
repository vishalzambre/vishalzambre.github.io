---
layout: post
section-type: post
title: Github pre commit hook to validate commit message and description
category: git
tags: [ 'git', 'devops' ]
comments: false
---

To set up a Git pre-commit hook to validate the length of commit messages and descriptions, you can create a script that will be executed before each commit. This script can be placed in the `.git/hooks` directory of your repository. Here's how you can do it:

1. Navigate to your repository:

```sh
cd /path/to/your/repo
```

2. Create a pre-commit hook:
  Create a file named `pre-commit` in the `.git/hooks` directory:

```sh
touch .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

3. Edit the pre-commit hook:

Open the `.git/hooks/pre-commit` file in your preferred text editor and add the following script:

```sh
#!/bin/sh

# Define the maximum lengths for the commit message subject and description
MAX_SUBJECT_LENGTH=50
MAX_DESCRIPTION_LENGTH=72

# Get the commit message
commit_msg_file=$(git rev-parse --git-dir)/COMMIT_EDITMSG
commit_msg=$(head -n1 $commit_msg_file)
commit_desc=$(tail -n +2 $commit_msg_file | grep -vE '^[[:space:]]*$')

# Check the length of the commit subject
if [ ${#commit_msg} -gt $MAX_SUBJECT_LENGTH ]; then
    echo "Error: The commit message subject is too long (maximum $MAX_SUBJECT_LENGTH characters)."
    echo "Subject: $commit_msg"
    exit 1
fi

# Check the length of each line in the commit description
while IFS= read -r line; do
    if [ ${#line} -gt $MAX_DESCRIPTION_LENGTH ]; then
        echo "Error: A line in the commit description is too long (maximum $MAX_DESCRIPTION_LENGTH characters)."
        echo "Line: $line"
        exit 1
    fi
done <<< "$commit_desc"

exit 0

```

4. Make the script executable:

Ensure that the `pre-commit` file is executable:

```sh
chmod +x .git/hooks/pre-commit
```
