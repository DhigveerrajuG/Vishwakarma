# Universal Multi-Stage Container for Dhigveerraju G Portfolio
FROM node:24-alpine AS runner

WORKDIR /app

# Copy package descriptors
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile || npm install

# Copy application source files
COPY . .

# Build TypeScript
RUN pnpm run build

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]
