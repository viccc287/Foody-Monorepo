FROM node:22.11-slim

WORKDIR /app

COPY package*.json ./
COPY .env ./

RUN npm install

COPY src/ ./src/
COPY schema.sql ./

RUN mkdir -p storage/images

EXPOSE 3000

CMD ["node", "src/server.js"]