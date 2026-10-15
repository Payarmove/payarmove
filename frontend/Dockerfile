# Build and development environment for PayarMove React/Vite Frontend
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies with JSR registry support
COPY package.json package-lock.json* .npmrc* ./
RUN npm install

# Copy application source files
COPY . .

EXPOSE 5173

# Run Vite dev server accessible from all hosts
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
