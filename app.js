const Koa = require('koa')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const jwt = require('jsonwebtoken')
const { query, execute } = require('./src/mysql')
require('dotenv').config()

const {
  API_PORT,
  WS_PORT,
} = process.env

// 路由
const router = require('./src/router')

// ws服务
require('./src/websocket.js').listen(WS_PORT)

// 创建实例
const app = new Koa()

const getUserinfo = async token => {
  let userinfo = null
  try {
    let { username } = await jwt.verify(token, 'my secret')
    const rows = await query('SELECT * FROM `user` WHERE `username` = ?', [username])
    const { id, sex } = rows[0]
    userinfo = { id, username, sex }
  } catch (error) {}
  return userinfo
}

app
  .use(cors())
  .use(koaBody())
  .use(async (ctx, next) => {
    let token = ctx.headers.authorization || ''
    const userinfo = await getUserinfo(token.split(' ').pop())
    if (userinfo) {
      ctx.state.userinfo = userinfo
      console.log('api login: ', userinfo)
    } else {
      console.log('api: 未登录')
    }
    await next()
  })
  .use(router.routes(), router.allowedMethods())
// 监听端口
app.listen(API_PORT)
