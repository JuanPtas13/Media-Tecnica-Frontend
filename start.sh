#!/bin/bash

# ============================================================
# SCRIPT DE INICIALIZACIÓN - PANEL DE ADMINISTRACIÓN
# ============================================================
# 
# Este script configura y inicia el proyecto
# Uso: bash start.sh
#

set -e

echo "🚀 Inicializando Panel de Administración..."
echo "=================================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js v$(node --version) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm v$(npm --version) detectado"

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependencias..."
    npm install
    echo "✅ Dependencias instaladas"
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo ""
    echo "🔧 Creando archivo .env..."
    cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_TIMEOUT=30000
VITE_DEBUG=false
EOF
    echo "✅ Archivo .env creado"
    echo "   Edita el archivo .env si necesitas cambiar la URL de la API"
fi

echo ""
echo "=================================================="
echo "✨ Inicialización completada"
echo "=================================================="
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  Asegúrate de que el backend está corriendo:"
echo "    URL: http://localhost:8000"
echo ""
echo "2️⃣  Inicia el servidor frontend:"
echo "    npm run dev"
echo ""
echo "3️⃣  Abre tu navegador:"
echo "    http://localhost:5173"
echo ""
echo "4️⃣  Credenciales de prueba:"
echo "    Email: admin@test.com"
echo "    Password: admin123"
echo ""
echo "📚 Documentación:"
echo "   - README_ADMIN.md - Documentación completa"
echo "   - BEST_PRACTICES.md - Mejores prácticas"
echo "   - UPDATE_SUMMARY.md - Resumen de actualizaciones"
echo ""
echo "🧪 Testing:"
echo "    node test-api.js"
echo ""
echo "=================================================="
echo "¡Listo para comenzar! 🎉"
echo "=================================================="
