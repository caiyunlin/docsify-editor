# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /var/www

RUN mkdir -p /var/www/docs/

COPY docs /tmp/docs

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy server.js and docs folder to the working directory
COPY server.js ./
COPY start.sh ./

# Install dependencies
RUN npm install

VOLUME ["/var/www/docs"]

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["sh", "start.sh"]
