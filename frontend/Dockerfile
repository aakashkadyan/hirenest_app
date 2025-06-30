FROM node:22

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev"]
