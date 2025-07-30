# Use an official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose port
EXPOSE 3009

# Missing DATABASE_PATH environment variable
ENV NODE_ENV=production
ENV DATABASE_PATH=./database/studysync.db

# Start the app
CMD ["npm", "start"]
