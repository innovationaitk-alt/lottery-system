#!/bin/bash

# Digital Lottery System - Development Setup Script
# This script sets up the development environment

set -e

echo "=================================="
echo " Digital Lottery System Setup"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Pull required Docker images
echo ""
echo "Pulling Docker images..."
docker-compose pull

# Build services
echo ""
echo "Building services..."
docker-compose build

echo ""
echo "=================================="
echo " Setup Complete!"
echo "=================================="
echo ""
echo "To start the services, run:"
echo "  docker-compose up"
echo ""
echo "Or to run in background:"
echo "  docker-compose up -d"
echo ""
echo "Services will be available at:"
echo "  - API:        http://localhost:8000"
echo "  - Shop Web:   http://localhost:3000"
echo "  - Admin Web:  http://localhost:3001"
echo "  - MinIO:      http://localhost:9001"
echo "  - PostgreSQL: localhost:5432"
echo ""
