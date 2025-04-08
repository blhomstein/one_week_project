FROM node:22-alpine3.20

WORKDIR /app

COPY . .

WORKDIR /app/client-side

RUN npm ci

RUN npm install react-router-dom --save

EXPOSE 5173

CMD [ "sh", "-c", "npm install && npm run dev" ]