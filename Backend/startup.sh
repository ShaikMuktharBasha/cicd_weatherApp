#!/bin/bash

# Start MySQL (MariaDB)
echo "Starting MariaDB..."
service mariadb start

# Wait for MySQL to be ready
echo "Waiting for MariaDB to be ready..."
while ! mysqladmin ping -h localhost --silent; do
    sleep 1
done

# Create database and user if they don't exist
echo "Setting up database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS weatherdb;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'weatheruser'@'localhost' IDENTIFIED BY 'weatherpass';"
mysql -u root -e "GRANT ALL PRIVILEGES ON weatherdb.* TO 'weatheruser'@'localhost';"
mysql -u root -e "FLUSH PRIVILEGES;"

# Import schema and data
echo "Importing database schema and data..."
mysql -u weatheruser -pweatherpass weatherdb < /app/db/schema.sql
mysql -u weatheruser -pweatherpass weatherdb < /app/db/data.sql

# Start the Spring Boot application
echo "Starting Spring Boot application..."
java -jar /app/backend.jar &

# Start nginx for frontend
echo "Starting nginx..."
nginx -g 'daemon off;' &

# Keep container running
wait