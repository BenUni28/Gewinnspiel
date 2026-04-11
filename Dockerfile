FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY public/ ./public/

RUN mkdir -p /app/data && chown app:app /app/data

USER app

EXPOSE 3000

CMD ["node", "server/index.js"]
