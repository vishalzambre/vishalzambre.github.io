---
layout: post
section-type: post
title: "Migrate Large MySQL Database from Physical to Managed Server with Near-Zero Downtime"
category: mysql
tags: [ 'mysql', 'database', 'migration', 'devops' ]
comments: true
---

# Step-by-Step Migration Guide

When your managed MySQL provider doesn't allow creating a replica, you can't use native replication. However, you *can still achieve near-zero downtime* with this approach.

## ✅ Snapshot + Binlog Replay (a.k.a. "manual replication")

We take a consistent snapshot, load it into the Managed MySQL instance, then **continuously apply source binlog events** to the managed database until cutover.

This is the closest thing to replication when native replication is unavailable.

---

## Overview

This guide walks you through migrating a large MySQL database from a physical/VM server to a managed MySQL service with minimal downtime. The approach uses:

- **mydumper/myloader** for fast, consistent snapshots
- **Binary log replay** for continuous synchronization
- **Read-only mode** for safe cutover

---

## Architecture

* **Source MySQL Server**: Must have **binary logs enabled**
* **Migration runner host**: A server (can be the source itself) that can connect to both:
  * Source MySQL (to read binary logs)
  * Managed MySQL (to apply changes)
* **Target Managed MySQL**: Receives changes via `mysqlbinlog | mysql`


---

## Prerequisites

Before starting the migration, ensure you have:

- Root or admin access to the source MySQL server
- Credentials for the managed MySQL instance
- Sufficient disk space for the database dump (at least 2x database size recommended)
- Network connectivity between migration runner and both databases
- MySQL client tools installed (`mysql`, `mysqldump`, `mysqlbinlog`)

---

## Environment Setup

Set up these environment variables on your migration runner host. Keep these values handy throughout the migration process:

```bash
# Source Database Configuration
export SOURCE_HOST=<your_source_host_ip>
export SOURCE_PORT=3306
export SOURCE_USER=root
export SOURCE_PASS=<your_source_password>

# Target Managed Database Configuration
export MANAGED_DB_HOST=<your_managed_db_host>
export MANAGED_DB_PORT=<your_managed_db_port>
export MANAGED_DB_USER=<your_managed_db_user>
export MANAGED_DB_PASS=<your_managed_db_password>

# Database Name
export DATABASE_NAME=<your_database_name>
```

---

# 1) Pre-flight checks (source)

### 1.1 Confirm MySQL is healthy

```bash
mysql -e "SELECT VERSION();"
mysql -e "SHOW GLOBAL STATUS LIKE 'Threads_connected';"
mysql -e "SHOW ENGINE INNODB STATUS\G" | head -100
```

### 1.2 Ensure you have disk space for dump

```bash
df -h
```

### 1.3 Confirm binlog is enabled / can be enabled

```bash
mysql -e "SHOW VARIABLES LIKE 'log_bin';"
```

---

# 2) Configure source for replication (required)

## 2.1 Enable binlog + set server_id + row format

Edit source MySQL config (commonly):

* `/etc/mysql/my.cnf`

Add/ensure:

```ini
[mysqld]
log_bin = mysql-bin
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 7
bind-address = 0.0.0.0
```

Restart:

```bash
sudo systemctl restart mysql
```

Verify:

```bash
mysql -e "SHOW VARIABLES LIKE 'server_id';"
mysql -e "SHOW VARIABLES LIKE 'log_bin';"
mysql -e "SHOW VARIABLES LIKE 'binlog_format';"
```
---

# 3) Install mydumper/myloader on the source (or a migration host)

```bash
sudo apt update
sudo apt install mydumper
mydumper --version
myloader --version
```

---

# 4) Capture binlog coordinates (needed for binary log replay)

On SOURCE (in MySQL):

```sql
FLUSH TABLES WITH READ LOCK;
SHOW MASTER STATUS;
```

Record:

* `File`  → `MASTER_LOG_FILE`
* `Position` → `MASTER_LOG_POS`

Then unlock:

```sql
UNLOCK TABLES;
```

> You can also confirm later in the mydumper `metadata` file, but recording now is good practice.

---

# 5) Take the initial snapshot using mydumper (no downtime)

Run on the SOURCE server or migration runner host:

```bash
export DUMP_DIR="migration_dump_$(date +%F)"
mkdir -p "$DUMP_DIR"

mydumper \
  --outputdir="$DUMP_DIR" \
  --threads=16 \
  --compress \
  --less-locking \
  --triggers \
  --events \
  --routines \
  --trx-consistency-only \
  --overwrite-tables \
  --verbose=3
```

**Options explained:**
- `--threads=16`: Use multiple threads for faster dumps (adjust based on your CPU cores)
- `--compress`: Compress output files to save disk space
- `--less-locking`: Minimize table locks during dump
- `--trx-consistency-only`: Ensure transactional consistency
- `--triggers --events --routines`: Include stored procedures, triggers, and events

After it finishes, confirm metadata:

```bash
cat "$DUMP_DIR/metadata"
```

Look for lines like:

```
Log: mysql-bin.000123
Pos: 456789
```

These values will be used for binary log replay in the next steps.

---

# 6) Load snapshot into Managed DB using myloader

Run this command to load the dump into your managed database:

```bash
myloader \
  --directory="$DUMP_DIR" \
  --threads=16 \
  --verbose=3 \
  --host="$MANAGED_DB_HOST" \
  --port="$MANAGED_DB_PORT" \
  --user="$MANAGED_DB_USER" \
  --password="$MANAGED_DB_PASS"
```

**Important notes:**
- This operation can take several hours for large databases
- Monitor disk space on both source and target
- Check myloader logs for any errors or warnings
- The managed database should be empty or you should use `--overwrite-tables` flag

---

# 7) Set up continuous binlog replay (optional but recommended)

This step keeps the managed database continuously in sync with the source until cutover. This significantly reduces cutover time.

On the migration runner host, run:

```bash
# Extract values from metadata file first
BINLOG_FILE=$(grep "^Log:" $DUMP_DIR/metadata | awk '{print $2}')
BINLOG_POS=$(grep "^Pos:" $DUMP_DIR/metadata | awk '{print $2}')

echo "Starting binlog replay from $BINLOG_FILE at position $BINLOG_POS"

# Start continuous binlog replay
mysqlbinlog --read-from-remote-server \
  --host=$SOURCE_HOST \
  --port=$SOURCE_PORT \
  --user=$SOURCE_USER \
  --password=$SOURCE_PASS \
  --start-position=$BINLOG_POS \
  $BINLOG_FILE \
  --stop-never \
  --raw \
  | mysql --host=$MANAGED_DB_HOST \
         --port=$MANAGED_DB_PORT \
         --user=$MANAGED_DB_USER \
         --password=$MANAGED_DB_PASS \
         $DATABASE_NAME
```

**Tips:**
- Run this in a `screen` or `tmux` session so it continues if your SSH connection drops
- Monitor the process to ensure it's running without errors
- The process will continuously stream and apply changes until you stop it
- Keep this running until you're ready for cutover

---

# 8) Cutover (expected downtime: a few minutes)

## 8.1 Put application into maintenance (stop writes)

* Stop app servers or enable maintenance mode
* Stop background workers/cron that write

## 8.2 Force SOURCE to read-only (safety)

On SOURCE:

```sql
SET GLOBAL read_only = ON;
-- If available:
SET GLOBAL super_read_only = ON;
```

## 8.3 Wait for binlog replay to complete

If you set up continuous binlog replay in step 7, wait for it to catch up completely. Monitor the process to ensure all changes have been applied.

## 8.4 Point app to Managed DB

Update your application configuration:

```bash
# Update database connection settings
DB_HOST=$MANAGED_DB_HOST
DB_PORT=$MANAGED_DB_PORT
DB_USER=$MANAGED_DB_USER
DB_PASSWORD=$MANAGED_DB_PASS
DB_NAME=$DATABASE_NAME
```

Restart application servers and workers, then disable maintenance mode.

---

# 9) Post-cutover checks

After completing the cutover, perform these validation checks:

### Application functionality

- Test user login/authentication
- Verify read operations (browse pages, view data)
- Test write operations (create, update, delete records)
- Check background jobs and scheduled tasks

### Monitoring

- Review application error logs
- Check database error logs
- Monitor query performance and latency
- Verify connection pool stability
- Check database metrics (CPU, memory, connections)

---

# 10) Rollback plan

If you encounter critical issues immediately after cutover:

### Step 1: Enable maintenance mode

Put your application back into maintenance mode to stop all traffic.

### Step 2: Point app back to source database

```bash
# Revert database connection settings
DB_HOST=$SOURCE_HOST
DB_PORT=$SOURCE_PORT
DB_USER=$SOURCE_USER
DB_PASSWORD=$SOURCE_PASS
DB_NAME=$DATABASE_NAME
```

### Step 3: Re-enable writes on source

```sql
SET GLOBAL super_read_only = OFF;
SET GLOBAL read_only = OFF;
```

### Step 4: Restart and verify

Restart application servers and verify functionality before disabling maintenance mode.

> **⚠️ Important:** Any writes made to the managed database after cutover will be lost during rollback. Document any transactions that occurred during this window if needed.

---

# 11) Clean-up (after 1–2 weeks of stable operation)

Once you've confirmed the migration is successful and the managed database is running stably:

### Security cleanup

- Remove or restrict the replication user on the source database
- Close firewall rules for port 3306 if no longer needed
- Revoke unnecessary database permissions

### Data cleanup

- Archive database dumps to cold storage
- Delete local dump files once backups are confirmed in your backup system
- Document the migration for future reference

### Infrastructure cleanup

- Decommission the old database server/VM
- Update DNS records if applicable
- Update documentation and runbooks with new connection details

---

## Conclusion

This migration approach using snapshot + binlog replay provides near-zero downtime for large MySQL database migrations. The key benefits include:

- **Minimal downtime**: Only a few minutes during cutover
- **Safe rollback**: Easy to revert if issues arise
- **Verification**: Built-in validation steps throughout the process
- **Flexibility**: Works when native replication is unavailable

Remember to test this process in a staging environment first, and always have a rollback plan ready.

---

# 12) Validation Script

Use this script to verify table counts match between source and target databases.

## Setting up the validation script

Create a file named `compare_db_tables.sh` and set environment variables:

```bash
export SRC_HOST="<your_source_host>"
export SRC_PORT=3306
export SRC_USER="<your_source_user>"
export SRC_PASS="<your_source_password>"

export TGT_HOST="<your_target_host>"
export TGT_PORT=<your_target_port>
export TGT_USER="<your_target_user>"
export TGT_PASS="<your_target_password>"

export MYSQL_DB=<your_database_name>
```

## Running the script

```bash
chmod +x compare_db_tables.sh
./compare_db_tables.sh --output comparison_results.txt
```

## Script content

```bash
#!/bin/bash

# MySQL Database Table Count Comparison Script
# Usage: ./compare_db_tables.sh [options]
#
# This script compares record counts across all tables between two MySQL databases.
# Useful for verifying data integrity after database restore operations.

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DB1_HOST="${SRC_HOST:-localhost}"
DB1_PORT="${SRC_PORT:-3306}"
DB1_USER="${SRC_USER:-root}"
DB1_PASS="${SRC_PASS:-}"
DB1_NAME="${MYSQL_DB:-}"

DB2_HOST="${TGT_HOST:-localhost}"
DB2_PORT="${TGT_PORT:-3306}"
DB2_USER="${TGT_USER:-root}"
DB2_PASS="${TGT_PASS:-}"
DB2_NAME="${MYSQL_DB:-}"

OUTPUT_FILE=""
VERBOSE=false

# Print usage information
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Compare table record counts between two MySQL databases.

OPTIONS:
    -h, --help              Show this help message

    Database 1 (Source):
    --db1-host HOST         Database 1 host (default: localhost)
    --db1-port PORT         Database 1 port (default: 3306)
    --db1-user USER         Database 1 user (default: root)
    --db1-pass PASS         Database 1 password
    --db1-name NAME         Database 1 name (required)

    Database 2 (Target):
    --db2-host HOST         Database 2 host (default: localhost)
    --db2-port PORT         Database 2 port (default: 3306)
    --db2-user USER         Database 2 user (default: root)
    --db2-pass PASS         Database 2 password
    --db2-name NAME         Database 2 name (required)

    Output:
    -o, --output FILE       Write results to file
    -v, --verbose           Verbose output

ENVIRONMENT VARIABLES:
    DB1_HOST, DB1_PORT, DB1_USER, DB1_PASS, DB1_NAME
    DB2_HOST, DB2_PORT, DB2_USER, DB2_PASS, DB2_NAME

EXAMPLES:
    # Compare two databases on same host
    $0 --db1-name original_db --db2-name restored_db --db1-pass secret

    # Compare databases on different hosts
    $0 --db1-host prod.example.com --db1-name prod_db --db1-user admin --db1-pass pass1 \\
       --db2-host staging.example.com --db2-name staging_db --db2-user admin --db2-pass pass2

    # Using environment variables
    export DB1_NAME=original_db
    export DB2_NAME=restored_db
    export DB1_PASS=secret
    export DB2_PASS=secret
    $0

EOF
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        --db1-host)
            DB1_HOST="$2"
            shift 2
            ;;
        --db1-port)
            DB1_PORT="$2"
            shift 2
            ;;
        --db1-user)
            DB1_USER="$2"
            shift 2
            ;;
        --db1-pass)
            DB1_PASS="$2"
            shift 2
            ;;
        --db1-name)
            DB1_NAME="$2"
            shift 2
            ;;
        --db2-host)
            DB2_HOST="$2"
            shift 2
            ;;
        --db2-port)
            DB2_PORT="$2"
            shift 2
            ;;
        --db2-user)
            DB2_USER="$2"
            shift 2
            ;;
        --db2-pass)
            DB2_PASS="$2"
            shift 2
            ;;
        --db2-name)
            DB2_NAME="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            usage
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DB1_NAME" ]]; then
    echo -e "${RED}Error: Database 1 name is required (--db1-name or DB1_NAME)${NC}"
    exit 1
fi

if [[ -z "$DB2_NAME" ]]; then
    echo -e "${RED}Error: Database 2 name is required (--db2-name or DB2_NAME)${NC}"
    exit 1
fi

# Check if mysql client is available
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}Error: mysql client not found. Please install MySQL client.${NC}"
    exit 1
fi

# Build MySQL connection strings
MYSQL1_CMD="mysql -h${DB1_HOST} -P${DB1_PORT} -u${DB1_USER}"
if [[ -n "$DB1_PASS" ]]; then
    MYSQL1_CMD="$MYSQL1_CMD -p${DB1_PASS}"
fi

MYSQL2_CMD="mysql -h${DB2_HOST} -P${DB2_PORT} -u${DB2_USER}"
if [[ -n "$DB2_PASS" ]]; then
    MYSQL2_CMD="$MYSQL2_CMD -p${DB2_PASS}"
fi

# Function to test database connection
test_connection() {
    local mysql_cmd=$1
    local db_name=$2
    local db_label=$3

    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}Testing connection to $db_label ($db_name)...${NC}"
    fi

    if ! $mysql_cmd -e "USE $db_name;" 2>/dev/null; then
        echo -e "${RED}Error: Cannot connect to $db_label ($db_name)${NC}"
        return 1
    fi

    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${GREEN}Connection successful${NC}"
    fi
    return 0
}

# Function to get table list
get_tables() {
    local mysql_cmd=$1
    local db_name=$2

    $mysql_cmd -N -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='$db_name' AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME;" 2>/dev/null
}

# Function to get table count
get_table_count() {
    local mysql_cmd=$1
    local db_name=$2
    local table_name=$3

    $mysql_cmd -N -e "SELECT COUNT(*) FROM \`$db_name\`.\`$table_name\`;" 2>/dev/null || echo "ERROR"
}

# Function to print output (both to console and file if specified)
print_output() {
    echo -e "$1"
    if [[ -n "$OUTPUT_FILE" ]]; then
        echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$OUTPUT_FILE"
    fi
}

# Main execution
echo ""
print_output "${BLUE}========================================${NC}"
print_output "${BLUE}MySQL Database Table Count Comparison${NC}"
print_output "${BLUE}========================================${NC}"
echo ""
print_output "Database 1 (Source): ${YELLOW}${DB1_USER}@${DB1_HOST}:${DB1_PORT}/${DB1_NAME}${NC}"
print_output "Database 2 (Target): ${YELLOW}${DB2_USER}@${DB2_HOST}:${DB2_PORT}/${DB2_NAME}${NC}"
echo ""

# Clear output file if it exists
if [[ -n "$OUTPUT_FILE" ]]; then
    > "$OUTPUT_FILE"
    echo "Writing results to: $OUTPUT_FILE"
    echo ""
fi

# Test connections
print_output "${BLUE}Testing database connections...${NC}"
if ! test_connection "$MYSQL1_CMD" "$DB1_NAME" "Database 1"; then
    exit 1
fi
if ! test_connection "$MYSQL2_CMD" "$DB2_NAME" "Database 2"; then
    exit 1
fi
print_output "${GREEN}✓ Both database connections successful${NC}"
echo ""

# Get table lists
print_output "${BLUE}Fetching table lists...${NC}"
DB1_TABLES=$(get_tables "$MYSQL1_CMD" "$DB1_NAME")
DB2_TABLES=$(get_tables "$MYSQL2_CMD" "$DB2_NAME")

# Create unique list of all tables
ALL_TABLES=$(echo -e "$DB1_TABLES\n$DB2_TABLES" | sort -u)
TOTAL_TABLES=$(echo "$ALL_TABLES" | wc -l | tr -d ' ')

print_output "${GREEN}✓ Found $TOTAL_TABLES unique table(s)${NC}"
echo ""

# Compare tables
print_output "${BLUE}Comparing table record counts...${NC}"
print_output "${BLUE}========================================${NC}"
echo ""

MATCH_COUNT=0
DIFF_COUNT=0
MISSING_COUNT=0

printf "%-40s %15s %15s %10s\n" "Table Name" "Source Count" "Target Count" "Status"
print_output "$(printf '%.0s-' {1..85})"

while IFS= read -r table; do
    [[ -z "$table" ]] && continue

    # Check if table exists in both databases
    DB1_HAS_TABLE=$(echo "$DB1_TABLES" | grep -c "^$table$" || true)
    DB2_HAS_TABLE=$(echo "$DB2_TABLES" | grep -c "^$table$" || true)

    if [[ "$DB1_HAS_TABLE" -eq 0 ]]; then
        print_output "$(printf "%-40s %15s %15s ${YELLOW}%10s${NC}" "$table" "N/A" "?" "MISSING-DB1")"
        MISSING_COUNT=$((MISSING_COUNT + 1))
        continue
    fi

    if [[ "$DB2_HAS_TABLE" -eq 0 ]]; then
        print_output "$(printf "%-40s %15s %15s ${YELLOW}%10s${NC}" "$table" "?" "N/A" "MISSING-DB2")"
        MISSING_COUNT=$((MISSING_COUNT + 1))
        continue
    fi

    # Get counts from both databases
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}Counting records in $table...${NC}" >&2
    fi

    COUNT1=$(get_table_count "$MYSQL1_CMD" "$DB1_NAME" "$table")
    COUNT2=$(get_table_count "$MYSQL2_CMD" "$DB2_NAME" "$table")

    # Check for errors
    if [[ "$COUNT1" == "ERROR" ]] || [[ "$COUNT2" == "ERROR" ]]; then
        print_output "$(printf "%-40s %15s %15s ${RED}%10s${NC}" "$table" "$COUNT1" "$COUNT2" "ERROR")"
        continue
    fi

    # Compare counts
    if [[ "$COUNT1" -eq "$COUNT2" ]]; then
        print_output "$(printf "%-40s %15s %15s ${GREEN}%10s${NC}" "$table" "$COUNT1" "$COUNT2" "MATCH")"
        MATCH_COUNT=$((MATCH_COUNT + 1))
    else
        DIFF=$((COUNT2 - COUNT1))
        if [[ $DIFF -gt 0 ]]; then
            DIFF_STR="+$DIFF"
        else
            DIFF_STR="$DIFF"
        fi
        print_output "$(printf "%-40s %15s %15s ${RED}%10s${NC}" "$table" "$COUNT1" "$COUNT2" "$DIFF_STR")"
        DIFF_COUNT=$((DIFF_COUNT + 1))
    fi

done <<< "$ALL_TABLES"

# Print summary
echo ""
print_output "${BLUE}========================================${NC}"
print_output "${BLUE}Summary${NC}"
print_output "${BLUE}========================================${NC}"
print_output "Total tables compared:    ${BLUE}$TOTAL_TABLES${NC}"
print_output "Tables matching:          ${GREEN}$MATCH_COUNT${NC}"
print_output "Tables with differences:  ${RED}$DIFF_COUNT${NC}"
print_output "Tables missing:           ${YELLOW}$MISSING_COUNT${NC}"
echo ""

# Exit with appropriate code
if [[ $DIFF_COUNT -eq 0 ]] && [[ $MISSING_COUNT -eq 0 ]]; then
    print_output "${GREEN}✓ All tables match! Database restore verification successful.${NC}"
    exit 0
else
    print_output "${RED}✗ Differences found! Please review the results above.${NC}"
    exit 1
fi
```
