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

        // token
        TOKEN_EXPIRES: '2d',

        // static
        STATIC_PATH: '/usr/share/nginx/static',
        STATIC_HOST: 'http://39.106.154.181',

        // upload
        UPLOAD_PATH: '/usr/share/nginx/static/upload',

        // nginx
        NGINX_HOST: 'http://39.106.154.181',
        NGINX_PORT: 8080,
      },
    },
  ],
  deploy: {
    production: {
      user: 'root',
      host: '39.106.154.181',
      ref: 'origin/dev',
      repo: 'https://github.com/yancoding/server.git',
      path: '~/www/server',
      'post-deploy': 'cnpm install & pm2 startOrRestart ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    }
  },
};
