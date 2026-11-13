FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
