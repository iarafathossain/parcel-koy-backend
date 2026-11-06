module.exports = {
  apps: [
    {
      name: "parcelkoy-backend",
      script: "dist/src/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      out_file: "./logs/parcelkoy-backend-out.log",
      error_file: "./logs/parcelkoy-backend-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
