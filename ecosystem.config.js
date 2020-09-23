module.exports = {
  apps: [
    {
      name: 'server',
      script: './app.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        // mail
        MAIL_HOST: 'smtp.163.com',
        MAIL_PORT: 465,
        MAIL_USER: 'yanraspi@163.com',
        MAIL_PASS: 'JCSEYJIKQUILXNME',

        // port
        API_PORT: 4000,
        WS_PORT: 3000,

        // static
        STATIC_PATH: '/media',
        STATIC_HOST: 'http://192.168.3.3',
      },
    },
  ],
  deploy: {
    production: {
      user: 'pi',
      host: '192.168.3.3',
      ref: 'origin/dev',
      repo: 'git@github.com:yancoding/server.git',
      path: '~/www/server',
      'post-deploy': 'cnpm install & pm2 startOrRestart ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    }
  },
};
