#!/bin/sh
set -e

echo "Waiting for Postgres"
pg_isready

echo "running migrations..."
npm run migration:run:prod

echo "Seeding data..."
npm run seed:prod

echo "Starting app..."
exec "$@"