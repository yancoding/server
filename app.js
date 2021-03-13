const Koa = require('koa')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const KoaStatic = require('koa-static')
const jwt = require('jsonwebtoken')
const { query, execute } = require('./mysql')
require('dotenv').config()

const {
  API_PORT,
  WS_PORT,
  STATIC_PATH,
} = process.env

// 路由
const index = require('./routes/index')
const users = require('./routes/users')
const disk = require('./routes/disk')
const register = require('./routes/register')
const login = require('./routes/login')

// ws服务
require('./websocket.js').listen(WS_PORT)

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
      console.log(userinfo)
    } else {
      console.log('api: 未登录')
    }
    await next()
  })
  .use(index.routes(), index.allowedMethods())
  .use(users.routes(), users.allowedMethods())
  .use(disk.routes(), disk.allowedMethods())
  .use(register.routes(), register.allowedMethods())
  .use(login.routes(), login.allowedMethods())
  // .use(KoaStatic(STATIC_PATH))
// 监听端口
app.listen(API_PORT)
