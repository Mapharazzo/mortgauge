# Use the official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Install http-server globally
RUN npm install -g http-server

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["http-server", "build", "-p", "3000"]
