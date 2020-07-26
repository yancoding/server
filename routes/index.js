const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
  .post('/register', async (ctx, next) => {
    const { username, password } = ctx.request.body
    if (
      typeof username === 'undefined' ||
      typeof password === 'undefined'
    ) {
      ctx.body = {
        success: false,
        code: 1,
        msg: '未找到参数[username, password]',
      }
      return
    }

    if (userList.includes(username)) {
      ctx.body = {
        success: false,
        code: 2,
        msg: '用户已存在',
      }
      return
    } 

    let salt = ''
    try {
      salt = bcrypt.getSalt(password)
    } catch (err) {
      ctx.body = {
        success: false,
        code: 3,
        msg: '请勿使用明文密码注册',
      }
    }

    try {
      const hash = await bcrypt.hash(password, 0)
      const user = {
        username,
        password: bcrypt.hash,
        salt,
      }
      ctx.body = {
        success: true,
        data: null,
        msg: '注册成功',
      }
    } catch (err) {
      ctx.body = {
        success: false,
        code: 4,
        msg: '注册异常,请重试',
      }
    }
  })

module.exports = router
