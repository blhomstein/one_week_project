FROM node:22-alpine3.20

WORKDIR /app

COPY package* .

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD [ "sh", "-c", "npx prisma generate && npx prisma db push && node index.js" ]