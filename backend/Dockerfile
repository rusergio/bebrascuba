# bebrascuba/api/Dockerfile
FROM php:8.2-fpm

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip curl git \
    libfreetype6-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \
    zlib1g-dev libzip-dev pkg-config \
  && docker-php-ext-configure gd \
       --with-freetype \
       --with-jpeg \
       --with-webp \
  && docker-php-ext-install -j"$(nproc)" \
       gd pdo_pgsql zip

COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

RUN composer install

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
