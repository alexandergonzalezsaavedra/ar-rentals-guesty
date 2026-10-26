// PM2 config for production (vaivencol.com).
// Fork mode with a single instance: the Guesty access token is cached in
// memory and in ./.cache, and Guesty rate-limits token requests.
module.exports = {
  apps: [
    {
      name: 'vaiven',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 127.0.0.1',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      time: true,
    },
  ],
};
