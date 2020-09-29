const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('../mysql')
const router = new Router()

router.prefix('/login')

router
  .get('/', async (ctx, next) => {
    ctx.body = '登录api'
  })
  .post('/', async (ctx, next) => {
    const { username, password } = ctx.request.body
    const rows = await query('SELECT * FROM `user` WHERE `username` = ?', [username])
    if (rows.length === 0) {
      ctx.body = {
        success: false,
        data: null,
        msg: '用户不存在',
      }
      return
    }
    let hash = rows[0].password
    if (await bcrypt.compare(password, hash)) {
        const payload = {
            username
        }
        const secret = 'my secret'
        const token = jwt.sign(payload, secret, { expiresIn: '1h' })
        ctx.body = {
            success: true,
            data: {
              token,
            },
            msg: '登录成功',
        }
    } else {
      ctx.body = {
        success: false,
        data: null,
        msg: '用户名或密码错误',
      }
    }
  })

module.exports = router
