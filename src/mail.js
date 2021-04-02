const nodemailer = require('nodemailer')
require('dotenv').config()
const {
  MAIL_HOST: host,
  MAIL_PORT: port,
  MAIL_USER: user,
  MAIL_PASS: pass,
} = process.env

const sendMail = async (mailOptions) => {  
  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  })
  
  await transporter.sendMail(mailOptions)
}

sendMail({
  from: `raspi server <${user}>`,
  to: 'yancoding@qq.com',
  subject: 'hello yan',
  text: 'this from raspi',
  html: `
    <h1>邮件通知</h1>
    <p>这里有一张图片</p>
    <div>
      <img style="width: 100%;" src="https://dss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1354268575,1268995723&fm=26&gp=0.jpg">
    </div>
    <a href="http://baidu.com">baidu</a>
    `
})
  .then(() => {
    console.log('send success')
  })
  .catch(err => {
    console.log('send failed: ', err)
  })
