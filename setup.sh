#!/data/data/com.termux/files/usr/bin/bash
# ─── KILLERCG — First Time Setup ─────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════╗"
echo "║  🤖 KILLERCG — CONFIGURACIÓN    ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── Pedir número de WhatsApp del bot ──────────────────────────────────────────
echo "📱 Ingresa el número de WhatsApp del BOT (el número que usará el bot)"
echo "   Formato: solo números, sin +, sin espacios"
echo "   Ejemplo: 595981234567"
echo ""
read -p "➡️  Número: " WA_NUMBER

# Limpiar: solo dejar dígitos
WA_NUMBER=$(echo "$WA_NUMBER" | tr -dc '0-9')

if [ -z "$WA_NUMBER" ]; then
  echo "❌ Número inválido. Volvé a ejecutar: bash setup.sh"
  exit 1
fi

# ── Guardar en .env ───────────────────────────────────────────────────────────
cat > .env << ENVEOF
WA_PHONE_NUMBER=$WA_NUMBER
SESSION_SECRET=killercg-secret-$(date +%s)
NODE_ENV=production
PORT=5000
BASE_PATH=/
ENVEOF

echo ""
echo "✅ Guardado en .env"
echo "   Número configurado: $WA_NUMBER"
echo ""

# ── Crear carpeta de logs ─────────────────────────────────────────────────────
mkdir -p logs

# ── Iniciar con PM2 ──────────────────────────────────────────────────────────
echo "🚀 Iniciando KILLERCG..."
pm2 delete killercg 2>/dev/null || true
pm2 start pm2.config.cjs
pm2 save

echo ""
echo "╔══════════════════════════════════╗"
echo "║  ✅ BOT INICIADO — Ver el código ║"
echo "╚══════════════════════════════════╝"
echo ""
echo "👇 Ejecuta esto para ver el código de vinculación:"
echo ""
echo "   pm2 logs killercg"
echo ""
echo "Luego en WhatsApp:"
echo "  ⚙️ Ajustes → Dispositivos vinculados → Vincular con número → ingresá el código"
echo ""

# ── Activar wakelock para que Android no mate Termux ─────────────────────
echo "🔒 Activando wakelock (evita que Android mate el bot)..."
termux-wake-lock 2>/dev/null && echo "✅ Wakelock activado." || echo "⚠️  Instala termux-api: pkg install termux-api"

# ── Agregar pm2 resurrect al bashrc ──────────────────────────────────────
if ! grep -q "pm2 resurrect" ~/.bashrc 2>/dev/null; then
  echo 'pm2 resurrect 2>/dev/null' >> ~/.bashrc
  echo "✅ PM2 auto-start agregado a .bashrc"
fi
