 - docker run -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
 - bunx prisma migrate dev --name init
 - bunx prisma generate
 - bun run apps/ws-server/src/index.ts

 created docker files 

 - docker build --build-arg DATABASE_URL=${DATABASE_URL} -t todo-app-frontend:dev -f docker/Dockerfile.frontend .
 - docker build -t todo-app-backend:dev -f docker/Dockerfile.backend .
 - docker build -t todo-app-ws:dev -f docker/Dockerfile.ws .
 

