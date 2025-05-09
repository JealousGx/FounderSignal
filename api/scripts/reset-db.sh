#!/bin/bash

echo "Resetting database..."

# Connect to Docker PostgreSQL container (using template1 as the connection db)
docker exec -it postgres-db psql -U admin -d template1 <<EOF
-- Terminate all connections to the target database
REVOKE CONNECT ON DATABASE postgres FROM public;

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'postgres';

-- Drop and recreate the database
DROP DATABASE IF EXISTS postgres;
CREATE DATABASE postgres WITH OWNER admin;

-- Reassign privileges
GRANT ALL PRIVILEGES ON DATABASE postgres TO admin;
EOF

echo "Database reset complete. Run the application to apply migrations."