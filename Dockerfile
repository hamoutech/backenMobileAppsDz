# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies (excluding dev dependencies)
RUN npm install --production && \
    npm cache clean --force && \
    npm prune --production

# Install nodemon as a dev dependency
RUN npm install --only=dev

# Copy .env file to the working directory
COPY .env ./

# Bundle app source
COPY . .

# Expose port 4000
EXPOSE 4000

# Start the application
CMD ["npm", "start"]