# 1. Base Image: Use a lightweight Node.js image
FROM node:22-alpine

# 2. Install curl for health checks
RUN apk add --no-cache curl

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy package.json and package-lock.json first to leverage Docker's layer caching
COPY package*.json ./

# 5. Install dependencies
RUN npm install

# 6. Copy the rest of your application's source code
COPY . .

# 7. Create logs directory
RUN mkdir -p logs

# 8. Expose the port your Express server runs on
EXPOSE 5002

# 9. The command to start your server
CMD [ "npm", "start" ]
# Or if you don't have an "npm start" script: CMD [ "node", "server.js" ]