FROM node:23-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY .env ./
COPY . ./

RUN npm install
RUN npm run build

FROM node:23-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]