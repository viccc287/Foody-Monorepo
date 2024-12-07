FROM node:23-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY .env ./

RUN npm install

COPY src/ ./src/
COPY schema.sql ./

RUN mkdir -p storage/images

EXPOSE 3000

CMD ["node", "src/server.js"]