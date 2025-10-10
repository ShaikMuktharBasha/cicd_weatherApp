# Multi-service container with Backend, Frontend, and MySQL
FROM maven:3-openjdk-17-slim AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY Backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY Backend/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:17-jdk-slim

    # Install required packages
    RUN apt-get update && apt-get install -y \
        curl \
        nginx \
        mariadb-server \
        gettext \
        procps \
        && rm -rf /var/lib/apt/lists/*# Configure MySQL
RUN mkdir -p /var/run/mysqld /var/log/mysql && \
    chown mysql:mysql /var/run/mysqld /var/log/mysql && \
    chmod 755 /var/run/mysqld /var/log/mysql

# Set working directory
WORKDIR /app

# Copy the Spring Boot jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Copy database files
COPY Backend/src/main/resources/db/schema.sql /tmp/schema.sql
COPY Backend/src/main/resources/db/data.sql /tmp/data.sql

# Copy frontend files
COPY Frontend /usr/share/nginx/html
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Set default backend URL for frontend
ENV BACKEND_URL=http://localhost:8085

# Substitute environment variables in HTML
RUN envsubst '$BACKEND_URL' < /usr/share/nginx/html/index.html > /tmp/index.html && \
    mv /tmp/index.html /usr/share/nginx/html/index.html

# Configure nginx for port 3000
RUN sed -i 's/listen 80;/listen 3000;/' /etc/nginx/conf.d/default.conf

# Create MySQL configuration
RUN mkdir -p /etc/mysql/mariadb.conf.d && \
    echo "[mysqld]\n\
bind-address = 0.0.0.0\n\
port = 3306\n\
socket = /var/run/mysqld/mysqld.sock\n\
datadir = /var/lib/mysql\n\
log-error = /var/log/mysql/error.log\n\
pid-file = /var/run/mysqld/mysqld.pid\n\
user = mysql\n\
skip-name-resolve\n\
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\n\
innodb_buffer_pool_size = 16M\n\
innodb_log_file_size = 5M\n\
innodb_flush_log_at_trx_commit = 1\n\
innodb_lock_wait_timeout = 50" > /etc/mysql/mariadb.conf.d/mysqld.cnf

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start MariaDB service\n\
service mariadb start\n\
\n\
# Wait for MariaDB to be ready\n\
until mysqladmin ping -h localhost --silent; do\n\
    echo "Waiting for MariaDB..."\n\
    sleep 2\n\
done\n\
\n\
# Initialize database\n\
mysql -u root << EOF\n\
CREATE DATABASE IF NOT EXISTS weatherdb;\n\
USE weatherdb;\n\
EOF\n\
\n\
# Run schema and data scripts\n\
mysql -u root weatherdb < /tmp/schema.sql\n\
mysql -u root weatherdb < /tmp/data.sql\n\
\n\
# Create application user\n\
mysql -u root << EOF\n\
CREATE USER IF NOT EXISTS '\''weatheruser'\''@'\''%'\'' IDENTIFIED BY '\''weatherpass'\'';\n\
GRANT ALL PRIVILEGES ON weatherdb.* TO '\''weatheruser'\''@'\''%'\'';\n\
FLUSH PRIVILEGES;\n\
EOF\n\
\n\
echo "Database initialized successfully"\n\
\n\
# Start nginx in background\n\
nginx\n\
\n\
# Start Spring Boot application\n\
echo "Starting Spring Boot application..."\n\
exec java -jar /app/app.jar' > /start.sh && chmod +x /start.sh

# Expose ports
EXPOSE 8085 3000 3306

# Start all services
CMD ["/start.sh"]