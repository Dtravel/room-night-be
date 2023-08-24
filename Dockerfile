FROM node:16.16.0-alpine
RUN apk add curl
WORKDIR /app
COPY package*.json ./
COPY dist ./dist
COPY node_modules ./node_modules
COPY prisma ./prisma
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
