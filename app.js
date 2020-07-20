const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const cors = require('@koa/cors')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
require('dotenv').config()

const { API_PORT: port } = process.env

// 路由
const index = require('./routes/index')
const users = require('./routes/users')
const disk = require('./routes/disk')

// ws服务
require('./websocket')

// 创建实例
const app = new Koa()
const router = new Router()

app
  .use(cors())
  .use(bodyParser())
	.use(index.routes(), index.allowedMethods())
	.use(users.routes(), users.allowedMethods())
	.use(disk.routes(), disk.allowedMethods())
// 监听端口
app.listen({
  host: '0.0.0.0',
  port,
})
