const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const KoaStatic = require('koa-static')
require('./websocket.js')
require('dotenv').config()

const {
  PORT,
  STATIC_PATH,
} = process.env

// 路由
const index = require('./routes/index')
const users = require('./routes/users')
const disk = require('./routes/disk')

// ws服务
require('./websocket')

// 创建实例
const app = new Koa()

app
  .use(cors())
  .use(bodyParser())
  .use(index.routes(), index.allowedMethods())
  .use(users.routes(), users.allowedMethods())
  .use(disk.routes(), disk.allowedMethods())
  .use(async (ctx, next) => {
    // 拦截
    console.log(ctx.request.query)
    if (ctx.request.query.session === '123') {
      await next()
    } else {
      return
    }
  })
  .use(KoaStatic(STATIC_PATH))
// 监听端口
app.listen(PORT)
