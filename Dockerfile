FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install sharp

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main"]