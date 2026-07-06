FROM php:8.2-apache

# Install ekstensi mysqli
RUN docker-php-ext-install mysqli

# Copy seluruh source code
COPY . /var/www/html

# Set permission
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80