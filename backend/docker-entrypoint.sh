#!/bin/sh
set -e
cd /var/www

# Composer: volume nomeado en `vendor/` pode estar baleiro no primeiro arranque
if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

# Primeira execución: .env desde exemplo (opcional); non sobrescribe o teu .env local
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  php artisan key:generate --no-interaction
fi

# Opcional: migrar automáticamente al arrancar contenedor
if [ "${AUTO_MIGRATE:-false}" = "true" ]; then
  php artisan migrate --force --no-interaction
fi

# Opcional: seed automático sin prompts (útil en onboarding local)
if [ "${AUTO_SEED:-false}" = "true" ]; then
  SEED_WITHOUT_PROMPTS=true php artisan db:seed --force --no-interaction
fi

exec php artisan serve --host=0.0.0.0 --port=8000
