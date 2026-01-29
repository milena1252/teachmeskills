#!/bin/sh
set -e

echo "Waiting for Postgres"
until PGPASSWORD="$DB_PASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE"; do
  sleep 1
done

echo "running migrations..."
npm run migration:run:prod

#echo "Seeding data..."
#npm run seed:prod

echo "Starting app..."
exec "$@"