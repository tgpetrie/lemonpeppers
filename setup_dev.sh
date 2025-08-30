#!/bin/bash

# BHABIT CBMOONERS - Development Environment Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status "🐰 Setting up BHABIT CBMOONERS Development Environment..."

# Check required commands
print_status "Checking prerequisites..."

if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3.13+ to continue."
    exit 1
fi

if ! command_exists npm; then
    print_error "Node.js/npm is not installed. Please install Node.js 22.17+ to continue."
    exit 1
fi

if ! command_exists git; then
    print_warning "Git is not installed. This is recommended for version control."
fi

print_success "Prerequisites check completed!"

# Python version check
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_status "Python version: $PYTHON_VERSION"

# Node version check
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Setup Python virtual environment
print_status "Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    print_success "Virtual environment created!"
else
    print_status "Virtual environment already exists."
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source .venv/bin/activate
print_success "Virtual environment activated!"

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip --quiet

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    print_success "Backend dependencies installed!"
else
    print_error "requirements.txt not found in backend directory!"
    exit 1
fi
cd ..

# Setup backend environment
print_status "Setting up backend environment..."
if [ ! -f "backend/.env.development" ] && [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env.development
    print_success "Backend environment file created from example!"
elif [ -f "backend/.env.development" ]; then
    print_status "Backend environment file already exists."
else
    print_warning "No backend environment example found."
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    # Clean install to avoid vite config issues
    print_status "Ensuring clean frontend dependency installation..."
    rm -rf node_modules package-lock.json .vite-temp node_modules/.vite-temp 2>/dev/null || true
    npm install
    print_success "Frontend dependencies installed!"
else
    print_error "package.json not found in frontend directory!"
    exit 1
fi

# Setup frontend environment
print_status "Setting up frontend environment..."
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    print_success "Frontend environment file created from example!"
elif [ -f ".env" ]; then
    print_status "Frontend environment file already exists."
else
    print_warning "No frontend environment example found."
fi
cd ..

# Create logs directory for backend
print_status "Setting up logging directory..."
mkdir -p backend/logs
print_success "Logging directory created!"

# Run tests to verify setup
print_status "Running backend tests to verify setup..."
cd backend
if [ -f "test_app.py" ]; then
    python -m pytest test_app.py -v
    if [ $? -eq 0 ]; then
        print_success "Backend tests passed!"
    else
        print_warning "Some backend tests failed. Check the output above."
    fi
else
    print_warning "No backend tests found."
fi
cd ..

# Check if ports are available
print_status "Checking port availability..."
PORTS_IN_USE=""

for port in 5001 5002 5003 5004 5005; do
    if lsof -i :$port >/dev/null 2>&1; then
        PORTS_IN_USE="$PORTS_IN_USE $port"
    fi
done

if [ -n "$PORTS_IN_USE" ]; then
    print_warning "Ports in use:$PORTS_IN_USE. Backend will auto-select next available port."
else
    print_success "Backend port 5001 is available."
fi

if lsof -i :5173 >/dev/null 2>&1; then
    print_warning "Port 5173 is already in use. Frontend will auto-select next available port."
else
    print_success "Frontend port 5173 is available."
fi

print_success "🎉 Development environment setup completed!"
echo ""
print_status "Next steps:"
echo "  1. Run './start_app.sh' to start both servers (ports auto-detected)"
echo "  2. The startup script will show you the actual URLs to use"
echo "  3. Backend and frontend will automatically connect"
echo ""
print_status "Useful commands:"
echo "  • './start_app.sh' - Start both servers with auto-port detection"
echo "  • './dev.sh start' - Alternative start command"
echo "  • './dev.sh status' - Check running servers"
echo "  • './dev.sh stop' - Stop all servers"
echo "  • 'source .venv/bin/activate' - Activate Python environment"
echo ""
print_status "The app will handle port conflicts automatically!"
print_success "Happy coding! 🐰"
