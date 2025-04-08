FROM node:22-alpine3.20

WORKDIR /app

COPY package* .

RUN npm ci

COPY . .

EXPOSE 8080

CMD [ "sh", "-c", "npm install && npx prisma generate && npx prisma db push && node index.js" ]