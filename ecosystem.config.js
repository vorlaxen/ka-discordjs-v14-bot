module.exports = {
  apps: [
    {
      name: "ka-bot",
      script: "src/app.ts",
      interpreter: "npx",
      interpreter_args: "tsx",
      cwd: "/mnt/c/Users/hakankygsz/Desktop/KA-BOT",
      watch: false,
      autorestart: true,
      max_restarts: 5,
      env: {
        NODE_ENV: "production"
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
