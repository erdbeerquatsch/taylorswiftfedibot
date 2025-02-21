FROM alpine:3.14
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY taylor.js package-lock.json package.json quotes /app
RUN npm install
ENTRYPOINT ["node", "taylor.js"]
