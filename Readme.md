📦 1. Instalação de Dependências

npm install
npm install prisma --save-dev
npm install @prisma/client
npm install @nestjs/swagger swagger-ui-express # add --legacy-peer-deps if need
npm install @nestjs/config

⚙️ 3. Configuração do Prisma

    3.1. Atualizar o Client:

    npx prisma init

    3.2. Rode a migração e gere o client:

    npx prisma migrate dev --name init && npx prisma generate dev

⚙️ 4. Configuração das váriaveis de ambiente

Siga o modelo no .env.example para configura as váriaveis de ambientes.

⚙️ 5. Executando o projeto

Modo de desenvolvimento: npm run start:dev
Modo de deploy: npm run start:prod

Acessar a url: http://localhost:3000/docs
