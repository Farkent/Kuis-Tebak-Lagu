FROM php:8.2-apache

# Install mysqli extension
RUN docker-php-ext-install mysqli

# Aktifkan Apache Rewrite
RUN a2enmod rewrite

# Salin seluruh project ke Apache
COPY . /var/www/html/

# Permission
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]