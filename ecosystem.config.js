module.exports = {
  apps: [
    {
      name: 'server',
      script: './app.js',
      log_date_format: '[YYYY-MM-DD HH:mm Z]',
      env: {
        // mail
        MAIL_HOST: 'smtp.163.com',
        MAIL_PORT: 465,
        MAIL_USER: 'yanraspi@163.com',
        MAIL_PASS: 'JCSEYJIKQUILXNME',

        // port
        PORT: 4000,

        // static
        STATIC_PATH: '/media',
        STATIC_HOST: 'http://192.168.1.2',
      },
    },
  ],
};
