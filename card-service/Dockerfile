FROM node:18-alpine

WORKDIR /app

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

COPY package*.json ./

RUN npm install
RUN npm install typeorm reflect-metadata dotenv pg

COPY . .

RUN npm run build

# Make the startup script executable
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"] 