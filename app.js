const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const KoaStatic = require('koa-static')
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
  .use(KoaStatic(STATIC_PATH))
  .use(cors())
  .use(bodyParser())
	.use(index.routes(), index.allowedMethods())
	.use(users.routes(), users.allowedMethods())
	.use(disk.routes(), disk.allowedMethods())
// 监听端口
app.listen(PORT)
