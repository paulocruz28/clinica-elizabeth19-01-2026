# [STI] Versão 2.0 - Performance & Estabilidade
# Usamos alpine para reduzir o tamanho da imagem de 900MB para ~160MB
FROM node:18-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia as dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./

# [STI] Comando essencial para instalar as bibliotecas do package.json
RUN npm install 

# Copia o restante dos arquivos (server.js, database.js, etc)
COPY . .

# Expõe a porta do servidor Node
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]