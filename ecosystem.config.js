module.exports = {
  apps: [
    {
      name: 'server',
      script: './app.js',
      env_dev: {
        NODE_ENV: 'dev',
      },
      env_prd: {
        NODE_ENV: 'prd',
      },
    },
  ],
};
