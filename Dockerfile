# Dockerfile per Software Gestione Turni

# Fase di build per il frontend
FROM node:16 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Fase di build per il backend
FROM node:16 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Immagine finale
FROM node:16-slim
WORKDIR /app

# Copia il backend
COPY --from=backend-build /app/backend /app/backend

# Copia il frontend build nella cartella public del backend
COPY --from=frontend-build /app/frontend/build /app/backend/public

# Espone la porta su cui il server ascolterà
EXPOSE 8080

# Imposta le variabili d'ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Imposta la directory di lavoro sul backend
WORKDIR /app/backend

# Comando per avviare l'applicazione
CMD ["npm", "start"]
