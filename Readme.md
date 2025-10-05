# 🚀 BloomWatch Backend

Backend da aplicação BloomWatch desenvolvido em NestJS

---

## 📦 Instalação das dependências

Para instalar as dependências do projeto, execute:

```bash
npm install --legacy-peer-deps
```

## ⚙️ Configuração das variáveis de ambiente

Siga o modelo no .env.example para configura as váriaveis de ambientes.

## ▶️ Executando o projeto localmente

Modo desenvolvimento:

```bash
npm run start:dev
```

Modo produção:

```bash
npm run start:prod
```

## 🐳 Executando com Docker

1. Build da imagem Docker

```bash
docker build -t bloomwatch-backend .
```

2. Rodando o container Docker

```bash
docker run -p 3000:3000 --env-file .env bloomwatch-backend
```

3. Acesse a API no navegador utilizando o swagger:

http://127.0.0.1:5000/docs
