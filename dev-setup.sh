#!/bin/bash

# HireNest Development Setup Script
echo "🚀 HireNest Development Setup"
echo "=============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env template..."
    cat > backend/.env << EOF
NODE_ENV=development
PORT=5002
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
LOG_LEVEL=info

# Database Configuration (Optional)
# Uncomment and configure one of these options:

# Option 1: MongoDB Atlas (Cloud)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hirenest?retryWrites=true&w=majority

# Option 2: Local MongoDB
# MONGO_URI=mongodb://localhost:27017/hirenest

# Option 3: Add MongoDB back to docker-compose.yml and use:
# MONGO_URI=mongodb://admin:password123@mongo:27017/hirenest?authSource=admin

# Email Configuration (Optional - for notifications)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
EOF
    echo "✅ Backend .env created. Please update with your values."
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env template..."
    cat > frontend/.env << EOF
VITE_BACKEND_URL=http://localhost:5002
VITE_APP_NAME=HireNest
NODE_ENV=development
EOF
    echo "✅ Frontend .env created. Please update with your values."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/.vite

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Show status
echo "📊 Container Status:"
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "🎉 Setup complete!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5002"
echo ""
echo "📝 Next Steps:"
echo "1. Configure your database in backend/.env (optional)"
echo "2. Update JWT_SECRET in backend/.env for security"
echo "3. Configure email settings if needed"
echo ""
echo "🗄️ Database Options:"
echo "• MongoDB Atlas (recommended for production)"
echo "• Local MongoDB installation"
echo "• Add MongoDB back to docker-compose.yml"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f          # Follow logs"
echo "  docker-compose restart          # Restart services"
echo "  docker-compose down             # Stop all services"
echo "  docker-compose exec backend sh  # Access backend container"
echo "  docker-compose exec frontend sh # Access frontend container" 