#!/data/data/com.termux/files/usr/bin/bash
# ─── KILLERCG — Termux Startup Script ────────────────────────────────────────
set -e

echo ""
echo "╔══════════════════════════════╗"
echo "║   🤖 KILLERCG - INICIANDO   ║"
echo "╚══════════════════════════════╝"
echo ""

# ── 1. Verificar que estamos en la carpeta correcta ──
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "❌ ERROR: Ejecuta este script desde la raíz del proyecto."
  echo "   Ej: cd /data/data/com.termux/files/home/Bot && bash termux-start.sh"
  exit 1
fi

# ── 2. Instalar dependencias si no existen ──
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias (primera vez, puede tardar)..."
  pnpm install --frozen-lockfile
  echo "✅ Dependencias instaladas."
fi

# ── 3. Compilar ──
echo "🔨 Compilando el bot..."
pnpm --filter @workspace/api-server run build
echo "✅ Compilación lista."

# ── 4. Iniciar con PM2 ──
echo "🚀 Iniciando KILLERCG con PM2..."
pm2 delete killercg 2>/dev/null || true
pm2 start pm2.config.cjs
pm2 save

echo ""
echo "╔══════════════════════════════╗"
echo "║  ✅ KILLERCG ESTÁ ONLINE 🟢  ║"
echo "╚══════════════════════════════╝"
echo ""
echo "📋 Comandos útiles:"
echo "  pm2 logs killercg     — ver logs en tiempo real"
echo "  pm2 status            — ver estado"
echo "  pm2 restart killercg  — reiniciar"
echo "  pm2 stop killercg     — detener"
echo ""
