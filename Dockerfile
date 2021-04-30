# FROM node:14.16.1 as build
FROM node:14.16.1

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

RUN npm install 

COPY . /app

EXPOSE 4000

CMD ["node","src/server.js"]