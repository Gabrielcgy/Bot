module.exports = {
  apps: [
    {
      name: "killercg",
      script: "artifacts/api-server/dist/index.mjs",
      interpreter: "node",
      interpreter_args: "--enable-source-maps",
      cwd: process.cwd(),
      watch: false,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        PORT: "5000",
        BASE_PATH: "/",
        SESSION_SECRET: process.env.SESSION_SECRET || "killercg-secret-2025",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
    },
  ],
};
