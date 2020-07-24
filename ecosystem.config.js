module.exports = {
  apps: [
    {
      name: 'server-dev',
      script: './app.js',
      watch: true,
      log_date_format: '[YYYY-MM-DD HH:mm Z]',
      env: {
        // mail
        MAIL_HOST: 'smtp.163.com',
        MAIL_PORT: 465,
        MAIL_USER: 'yanraspi@163.com',
        MAIL_PASS: 'JCSEYJIKQUILXNME',

        // port
        PORT: 8088,

        // static
        STATIC_PATH: '../static',
        STATIC_HOST: 'http://127.0.0.1',
      },
    },
    {
      name: 'server-prd',
      script: './app.js',
      log_date_format: '[YYYY-MM-DD HH:mm Z]',
      env: {
        // mail
        MAIL_HOST: 'smtp.163.com',
        MAIL_PORT: 465,
        MAIL_USER: 'yanraspi@163.com',
        MAIL_PASS: 'JCSEYJIKQUILXNME',

        // port
        PORT: 8081,

        // static
        STATIC_PATH: '/media',
        STATIC_HOST: 'http://192.168.1.2',
      },
    },
  ],
};
