const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const cors = require('@koa/cors')
const Router = require('@koa/router')

// 路由
const index = require('./routes/index')
const users = require('./routes/users')

// ws服务
require('./websocket')

// 创建实例
const app = new Koa()
const router = new Router()

app
  .use(cors())
	.use(index.routes(), index.allowedMethods())
	.use(users.routes(), users.allowedMethods())
// 监听端口
app.listen(8081)
