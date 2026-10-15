#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
while ! nc -z ${POSTGRES_HOST:-db} ${POSTGRES_PORT:-5432}; do
  sleep 0.5
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files for production Nginx serving
if [ "$DJANGO_DEBUG" = "False" ] || [ "$DJANGO_SETTINGS_MODULE" = "config.settings.production" ]; then
  echo "Collecting static files for production..."
  python manage.py collectstatic --noinput --clear || true
fi

exec "$@"
