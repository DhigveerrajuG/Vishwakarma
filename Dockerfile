FROM node:24-alpine AS runner
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile || npm install
COPY . .
RUN pnpm run build
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["npm", "start"]
