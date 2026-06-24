// ─── Carga .env si existe ─────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

module.exports = {
  apps: [
    {
      name: "killercg",
      script: "artifacts/api-server/dist/index.mjs",
      interpreter: "node",
      interpreter_args: "--enable-source-maps",
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      min_uptime: "10s",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: process.env.PORT || "5000",
        BASE_PATH: "/",
        WA_PHONE_NUMBER: process.env.WA_PHONE_NUMBER || "",
        SESSION_SECRET: process.env.SESSION_SECRET || "killercg-secret-2025",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
    },
  ],
};
