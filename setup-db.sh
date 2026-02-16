#!/bin/bash

set -e

echo "🚀 PinxeSplit Database Setup"
echo "============================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created. Please update it with your configuration if needed."
  echo ""
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  echo "Visit: https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose is not installed. Please install Docker Compose first."
  echo "Visit: https://docs.docker.com/compose/install/"
  exit 1
fi

# Use docker compose (v2) or docker-compose (v1)
DOCKER_COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker-compose"
fi

echo "🐳 Starting PostgreSQL container..."
$DOCKER_COMPOSE_CMD up -d postgres

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
# Wait for the healthcheck to pass
for i in {1..30}; do
  if docker exec pinxesplit-postgres pg_isready -U user -d pinxesplit > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ PostgreSQL failed to start within 30 seconds"
    exit 1
  fi
  sleep 1
done

echo ""
echo "📦 Installing dependencies (if needed)..."
npm install

echo ""
echo "🔧 Generating Prisma client..."
npm run prisma:generate --workspace=apps/api

echo ""
echo "📊 Running database migrations..."
npm run prisma:migrate --workspace=apps/api -- deploy

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📌 Database connection details:"
echo "   Host:     localhost"
echo "   Port:     5432"
echo "   Database: pinxesplit"
echo "   User:     user"
echo "   Password: password"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the development servers: npm run dev"
echo "   2. Stop PostgreSQL: $DOCKER_COMPOSE_CMD down"
echo "   3. View PostgreSQL logs: docker logs pinxesplit-postgres"
echo ""
