#!/bin/bash

echo "🚀 Starting StarkPay Frontend Development Server"
echo "=============================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local from example..."
    cp .env.example .env.local
    echo "📝 Please update .env.local with your contract addresses"
fi

# Start development server
echo "🌟 Starting Next.js development server..."
npm run dev