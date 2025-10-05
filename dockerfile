# ==============================
# Step 1: Install Dependencies
# ==============================
FROM node:20-alpine AS builder

# Diretório do container
WORKDIR /app

# Copia apenas os arquivos necessários
COPY package.json ./

# Instala as dependências
RUN npm install --legacy-peer-deps 

# Copia o restante do código fonte
COPY . .

# Compila o projeto
RUN npm run build

# ==============================
# Step 2: Build 
# ==============================
FROM node:20-alpine as runner

WORKDIR /app

# Copia os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copia o .env para dentro do container
COPY .env .env

# Define a porta padrão 
EXPOSE 5000

# Comando de inicialização
CMD ["node", "dist/main.js"]