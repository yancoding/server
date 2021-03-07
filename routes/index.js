const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const koaBody = require('koa-body')
const path = require('path')
const router = new Router()
let userList = ['yan']
router
  .get('/', async (ctx, next) => {
    ctx.body = {
      name: 'yan',
      age: 3,
    }
  })
  .get('/string', async (ctx, next) => {
    ctx.body = 'path /string'
  })
  .post('/upload', koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(process.env.STATIC_PATH, './upload'),
      keepExtensions: true,
      maxFieldsSize: 0,
      onFileBegin(name, file) {
        console.log({ name, file })
      },
    },
  }), async (ctx, next) => {
    console.log(ctx.request.files.file)
    ctx.body = {
      success: true,
      data: {
        url,
      },
      msg: '上传成功',
    }
  })

module.exports = router
