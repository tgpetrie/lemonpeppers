#!/bin/bash

# BHABIT CBMOONERS - Application Startup Script
# This script starts both the backend Flask server and frontend Vite development server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${BLUE}[BHABIT]${NC} $1"
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

# Function to cleanup background processes on exit
cleanup() {
  print_status "Shutting down servers..."
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  print_success "Servers stopped."
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

print_status "Starting BHABIT CBMOONERS Application..."

# Check required commands
if ! command_exists python3; then
  print_error "Python 3 is not installed. Please install Python 3.13+ to continue."
  exit 1
fi

if ! command_exists npm; then
  print_error "Node.js/npm is not installed. Please install Node.js 22.17+ to continue."
  exit 1
fi

# Check if backend exists
if [ ! -f "backend/app.py" ]; then
  print_error "Backend server not found! Please ensure 'backend/app.py' exists."
  exit 1
fi

# Check if frontend exists
if [ ! -d "frontend" ]; then
  print_error "Frontend directory not found! Please ensure 'frontend/' directory exists."
  exit 1
fi

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
  print_status "Activating Python virtual environment..."
  source .venv/bin/activate
  print_success "Virtual environment activated."
else
  print_warning "No virtual environment found. Consider creating one with: python3 -m venv .venv"
fi

# Install backend dependencies if needed
if [ -f "backend/requirements.txt" ]; then
  print_status "Checking backend dependencies..."
  cd backend
  pip install -q -r requirements.txt
  cd ..
  print_success "Backend dependencies verified."
fi

# Install frontend dependencies if needed
print_status "Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  print_status "Installing frontend dependencies..."
  # Clean install to avoid vite config issues
  rm -rf node_modules package-lock.json .vite-temp node_modules/.vite-temp 2>/dev/null || true
  npm install
  print_success "Frontend dependencies installed."
else
  print_success "Frontend dependencies verified."
fi
cd ..

# Start backend server
print_status "Preparing log files..."
# Truncate previous logs so tail shows fresh output
: > backend.log
: > frontend.log

print_status "Starting backend server (logs -> backend.log)..."
cd backend
# use python3 (we checked earlier) and redirect stdout/stderr to a log file
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start and detect the port
sleep 4

if ! ps -p $BACKEND_PID > /dev/null; then
  print_error "Backend server failed to start! See backend.log for details."
  tail -n +1 backend.log || true
  exit 1
fi

# Extract the actual port from backend logs
BACKEND_PORT=$(grep -o "Found available port: [0-9]\+" backend.log | tail -1 | grep -o "[0-9]\+" || echo "5001")
if [ -z "$BACKEND_PORT" ]; then
  BACKEND_PORT=$(grep -o "Running on.*:[0-9]\+" backend.log | tail -1 | grep -o "[0-9]\+" || echo "5001")
fi

print_success "Backend server started successfully (PID: $BACKEND_PID) on port $BACKEND_PORT"
export VITE_API_URL="http://localhost:$BACKEND_PORT"

print_status "Starting frontend development server with backend URL: $VITE_API_URL (logs -> frontend.log)..."
cd frontend

# Handle vite config issues by temporarily moving it if it causes problems
VITE_CONFIG_BACKUP=false
if [ -f "vite.config.js" ]; then
  print_status "Checking vite configuration..."
  # Test if vite config works by running a quick check
  if ! timeout 5 npx vite --version >/dev/null 2>&1; then
    print_warning "Vite config may have issues, temporarily backing up..."
    mv vite.config.js vite.config.js.backup
    VITE_CONFIG_BACKUP=true
  fi
fi

# Start frontend with the correct API URL and allow port auto-selection
VITE_API_URL="$VITE_API_URL" npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 4

if ! ps -p $FRONTEND_PID > /dev/null; then
  print_error "Frontend server failed to start! See frontend.log for details."
  tail -n +1 ../frontend.log || true
  
  # Try alternative startup method if regular method fails
  if [ "$VITE_CONFIG_BACKUP" = false ] && [ -f "vite.config.js" ]; then
    print_status "Trying alternative startup method..."
    mv vite.config.js vite.config.js.backup
    VITE_API_URL="$VITE_API_URL" npx vite --host --port 5173 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    sleep 3
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
      # Restore config and exit
      mv vite.config.js.backup vite.config.js 2>/dev/null || true
      exit 1
    fi
    print_warning "Started with alternative method (vite config backed up)"
  else
    exit 1
  fi
fi

# Restore vite config if it was backed up and startup succeeded
if [ "$VITE_CONFIG_BACKUP" = true ] && [ -f "vite.config.js.backup" ]; then
  mv vite.config.js.backup vite.config.js
  print_status "Vite config restored."
fi

# Extract frontend port from logs
FRONTEND_PORT=$(grep -o "Local:.*localhost:[0-9]\+" ../frontend.log | tail -1 | grep -o "[0-9]\+" || echo "5173")

cd ..
print_success "Frontend server started successfully (PID: $FRONTEND_PID) on port $FRONTEND_PORT"

print_success "🐰 BHABIT CBMOONERS is now running!"
print_status "Backend API: http://localhost:$BACKEND_PORT"
print_status "Frontend App: http://localhost:$FRONTEND_PORT"
print_status "Configured with backend URL: $VITE_API_URL"
print_status "Press Ctrl+C to stop both servers"

print_status "Streaming backend and frontend logs (press Ctrl+C to stop):"

# Stream both logs in the foreground so the user sees live output.
# When the user presses Ctrl+C this tail will exit and the trap will run cleanup().
tail -f backend.log frontend.log

# If tail exits for any reason, wait for background processes to exit as well
wait
