#!/bin/bash

# Portfolio Management Tool - Production Deployment Script

echo "🚀 Deploying Portfolio Management Tool..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the production version
echo "🔨 Building production version..."
if npm run build; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Check if the dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory 'dist' not found. Build may have failed."
    exit 1
fi

# Start the production server
echo "🌐 Starting production server..."
echo "📊 Production build served from /dist directory"
echo "🌐 Access the application at: http://localhost:3001"
echo "📝 Press Ctrl+C to stop the server"
echo ""

npm start 