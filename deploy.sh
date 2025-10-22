#!/bin/bash

# Employee Management System Deployment Script
# This script helps deploy the application using different methods

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed successfully!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env.local ]; then
        print_warning ".env.local not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env.local
            print_warning "Please update .env.local with your actual values before proceeding."
        else
            print_error ".env.example not found. Please create environment configuration manually."
            exit 1
        fi
    fi
    
    print_status "Environment setup completed!"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    # Seed database
    npx prisma db seed
    
    print_status "Database setup completed!"
}

# Function to build application
build_application() {
    print_status "Building application..."
    npm run build
    print_status "Application built successfully!"
}

# Function for Docker deployment
deploy_docker() {
    print_status "Starting Docker deployment..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "docker-compose is not installed. Please install docker-compose first."
        exit 1
    fi
    
    # Build and start services
    docker-compose up -d --build
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    docker-compose exec app npx prisma migrate deploy
    
    # Seed database
    docker-compose exec app npx prisma db seed
    
    print_status "Docker deployment completed!"
    print_status "Application is running at http://localhost:3000"
    print_status "Use 'docker-compose logs -f' to view logs"
}

# Function for Vercel deployment
deploy_vercel() {
    print_status "Starting Vercel deployment..."
    
    if ! command_exists vercel; then
        print_error "Vercel CLI is not installed. Please install it first:"
        print_error "npm i -g vercel"
        exit 1
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_status "Vercel deployment completed!"
    print_warning "Don't forget to set up your environment variables in Vercel dashboard:"
    print_warning "- DATABASE_URL"
    print_warning "- JWT_SECRET"
    print_warning "- NEXT_PUBLIC_APP_URL"
}

# Function for local development setup
setup_development() {
    print_status "Setting up development environment..."
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_database
    
    print_status "Development setup completed!"
    print_status "Run 'npm run dev' to start the development server"
}

# Function to show help
show_help() {
    echo "Employee Management System Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Setup development environment"
    echo "  docker      Deploy using Docker"
    echo "  vercel      Deploy to Vercel"
    echo "  build       Build the application"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh dev      # Setup development environment"
    echo "  ./deploy.sh docker   # Deploy with Docker"
    echo "  ./deploy.sh vercel   # Deploy to Vercel"
}

# Main script logic
case "${1:-help}" in
    "dev")
        setup_development
        ;;
    "docker")
        deploy_docker
        ;;
    "vercel")
        deploy_vercel
        ;;
    "build")
        check_prerequisites
        install_dependencies
        build_application
        ;;
    "help"|*)
        show_help
        ;;
esac
