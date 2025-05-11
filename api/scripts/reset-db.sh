#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Resetting database..."

# Connect to Docker PostgreSQL container (using template1 as the connection db)
docker exec -i postgres-db psql -U admin -d template1 <<EOF
\set ON_ERROR_STOP on

-- Drop and recreate the database (FORCE option for PostgreSQL 13+)
DROP DATABASE IF EXISTS postgres WITH (FORCE);
CREATE DATABASE postgres WITH OWNER admin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE postgres TO admin;
EOF

echo "Database reset complete. Run the application to apply migrations."