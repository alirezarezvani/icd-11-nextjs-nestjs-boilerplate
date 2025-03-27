FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development /app/.next ./.next
COPY --from=development /app/public ./public
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]