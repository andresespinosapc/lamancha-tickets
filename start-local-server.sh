#!/usr/bin/env bash
# Inicia el servidor en modo local con base de datos local

set -e

# Configuración del servidor local
export SERVER_MODE=local
export LOCAL_SERVER_ID=local-1
export DATABASE_URL=postgresql://postgres:password@localhost:5433/lamancha-tickets-local

LOCAL_DB_CONTAINER="lamancha-tickets-local-postgres"

# Verificar si Docker está disponible
if ! [ -x "$(command -v docker)" ]; then
  echo "Docker no está instalado. Por favor instala Docker y vuelve a intentar."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "El daemon de Docker no está corriendo. Por favor inicia Docker y vuelve a intentar."
  exit 1
fi

# Iniciar la base de datos local si no está corriendo
if ! [ "$(docker ps -q -f name=$LOCAL_DB_CONTAINER)" ]; then
  echo "Iniciando base de datos local..."
  docker-compose up -d postgres-local
  echo "Esperando a que la base de datos esté lista..."
  sleep 3
fi

echo ""
echo "=================================="
echo " Servidor Local - Modo Validación"
echo "=================================="
echo ""
echo "SERVER_MODE: $SERVER_MODE"
echo "LOCAL_SERVER_ID: $LOCAL_SERVER_ID"
echo "DATABASE_URL: $DATABASE_URL"
echo ""

npm run dev
