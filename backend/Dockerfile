FROM node:18
WORKDIR /app
COPY package*.json ./
# Este comando abaixo é o que vai resolver o erro do seu terminal:
RUN npm install 
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]