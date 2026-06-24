# 📱 KILLERCG — Instalación en Termux

Bot de WhatsApp corriendo 24/7 desde tu teléfono Android.

---

## ⚡ Instalación rápida (primera vez)

Abre Termux y pega estos comandos **uno por uno**:

### Paso 1 — Actualizar Termux
```bash
pkg update -y && pkg upgrade -y
```

### Paso 2 — Instalar dependencias del sistema
```bash
pkg install -y nodejs-lts git python make
```

### Paso 3 — Instalar pnpm y PM2
```bash
npm install -g pnpm pm2
```

### Paso 4 — Clonar el repositorio
```bash
cd ~
git clone https://github.com/Gabrielcgy/Bot.git
cd Bot
```

### Paso 5 — Instalar dependencias del proyecto
```bash
pnpm install --frozen-lockfile
```

### Paso 6 — Compilar el bot
```bash
pnpm --filter @workspace/api-server run build
```

### Paso 7 — Crear carpeta de logs
```bash
mkdir -p logs
```

### Paso 8 — Iniciar el bot con PM2
```bash
pm2 start pm2.config.cjs
pm2 save
```

---

## 📲 Ver el código de vinculación

Cuando el bot arranca por primera vez, **el código QR o pairing code aparece en los logs**:

```bash
pm2 logs killercg
```

Busca una línea como:
```
Pairing code: XXXX-XXXX
```

Vas a WhatsApp → Dispositivos vinculados → Vincular con número de teléfono → ingresa el código.

---

## 🔁 Que PM2 inicie solo al abrir Termux

Agrega esto al final de tu `.bashrc`:

```bash
echo 'pm2 resurrect 2>/dev/null' >> ~/.bashrc
```

Así cada vez que abras Termux, el bot se reanuda automáticamente.

---

## 📋 Comandos del día a día

| Comando | ¿Qué hace? |
|---------|------------|
| `pm2 logs killercg` | Ver logs en vivo |
| `pm2 status` | Ver si está corriendo |
| `pm2 restart killercg` | Reiniciar el bot |
| `pm2 stop killercg` | Parar el bot |
| `pm2 delete killercg` | Eliminar de PM2 |
| `bash termux-start.sh` | Rebuild + restart completo |

---

## 🔄 Actualizar el bot

Cuando haya cambios en GitHub:

```bash
cd ~/Bot
git pull
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
pm2 restart killercg
```

---

## 💡 Tips para 24/7

1. **Mantén el teléfono cargando** o con batería alta
2. En Ajustes → Batería → desactiva la optimización de batería para **Termux**
3. En Ajustes → Pantalla → pon el tiempo de pantalla apagada en **máximo** o usa una app de keep-awake
4. Activa la opción "Adquirir wakelock" en la notificación de Termux (el candado 🔒)
5. Si usas WiFi, desactiva "Desconectar WiFi al dormir" en los ajustes avanzados de WiFi

---

## ❗ Solución de problemas

### "command not found: pnpm"
```bash
npm install -g pnpm
```

### "Error: ENOENT" al build
```bash
pnpm install --frozen-lockfile
```

### El bot se desconecta de WhatsApp
```bash
pm2 logs killercg
# Busca el error y corre:
pm2 restart killercg
```

### "sharp" falla al instalar
```bash
pnpm add --filter @workspace/api-server sharp --ignore-scripts
```
