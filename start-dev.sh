#!/bin/bash

echo "🚀 Starting StarkPay Development Environment"
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  Warning: MongoDB doesn't appear to be running locally"
    echo "   Make sure MongoDB is running or update MONGODB_URI in .env"
fi

echo ""
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "🎨 Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3004"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait