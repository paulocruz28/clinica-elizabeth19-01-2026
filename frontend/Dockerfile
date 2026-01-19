# Usa uma imagem leve do servidor Nginx (ótimo para sites HTML/CSS)
FROM nginx:alpine

# Copia os arquivos do seu projeto para a pasta pública do Nginx dentro do container
COPY . /usr/share/nginx/html

# Expõe a porta 80 (padrão web)
EXPOSE 80