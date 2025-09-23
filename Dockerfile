# estágio de build
FROM node:22 AS builder

WORKDIR /app

# copia arquivos package e instala dependências
COPY package*.json ./
RUN npm install

# copia código fonte
COPY tsconfig.json ./
COPY gulpfile.js ./
COPY *.js *.ts ./
COPY ./nodes ./nodes
COPY ./credentials ./credentials

# constrói o node
RUN npm run build

# estágio final
FROM n8nio/n8n:latest

USER root

# cria o diretório do custom node
RUN mkdir -p /home/node/.n8n/custom

# copia o package do custom node do estágio builder
COPY --from=builder /app/dist /home/node/.n8n/custom/n8n-nodes-random
COPY package.json /home/node/.n8n/custom/n8n-nodes-random/

# define a propriedade para o usuário node
RUN chown -R node:node /home/node/.n8n/custom

USER node
WORKDIR /home/node

# instala as dependências do custom node
RUN cd /home/node/.n8n/custom/n8n-nodes-random && npm install --omit=dev