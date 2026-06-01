# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
# We listen on 5173 to match Vite's default for docker-compose consistency, or 80.
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
