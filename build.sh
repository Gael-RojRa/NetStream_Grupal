#!/bin/bash
set -e

echo "🚀 Iniciando build de NetStream..."

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm ci

# Build del frontend
echo "🔨 Construyendo frontend..."
npm run build

echo "✅ Build completado!"
