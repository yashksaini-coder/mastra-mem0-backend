FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm ci

# Copy the rest of the application
COPY . .

# Copy .env file if it exists, otherwise use .env.example
COPY .env* ./
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose the port your app runs on
EXPOSE 4111

# Start the application
CMD ["npm", "run", "dev"]
