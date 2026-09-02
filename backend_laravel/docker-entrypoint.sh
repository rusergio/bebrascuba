#!/bin/sh
set -e
cd /var/www

# Composer: volume nomeado en `vendor/` pode estar baleiro no primeiro arranque
if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

# Primeira execución: .env desde exemplo (opcional); non sobrescribe o teu .env local
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    # artisan serve falla se non existe .env (filemtime)
    touch .env
  fi
  if grep -q '^APP_KEY=$' .env 2>/dev/null || ! grep -q '^APP_KEY=' .env 2>/dev/null; then
    php artisan key:generate --no-interaction || true
  fi
fi

# Opcional: migrar automáticamente al arrancar contenedor
if [ "${AUTO_MIGRATE:-false}" = "true" ]; then
  php artisan migrate --force --no-interaction
fi

# Opcional: seed automático sin prompts (útil en onboarding local)
if [ "${AUTO_SEED:-false}" = "true" ]; then
  SEED_WITHOUT_PROMPTS=true php artisan db:seed --force --no-interaction
fi

# --no-reload evita crash de filemtime/.env en bind mounts de Windows/Docker
exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload
