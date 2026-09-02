# Laravel (desenvolvemento) — PHP 8.2 + Postgres, Zip, GD (Maatwebsite/Excel)
FROM php:8.2-cli-bookworm

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libicu-dev \
    zip unzip curl git \
    libfreetype6-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \
    zlib1g-dev libzip-dev pkg-config libonig-dev libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" gd pdo_pgsql zip bcmath intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/var/www/docker-entrypoint.sh"]
