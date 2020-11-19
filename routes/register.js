const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, execute } = require('../mysql')
const router = new Router()

router.prefix('/register')

router
  .get('/', async (ctx, next) => {
    ctx.body = '注册api'
  })
  .post('/', async (ctx, next) => {
    const { username, password } = ctx.request.body
    // 用户名是否已存在
    const rows = await query('SELECT * FROM `user` WHERE `username` = ?', [username])
    if (rows.length > 0) {
      ctx.body = {
        success: false,
        data: null,
        msg: '用户已存在',
      }
      return
    }
    // 前端是否已加密
    let salt = ''
    try {
      salt = bcrypt.getSalt(password)
    } catch (err) {
      ctx.body = {
        success: false,
        data: null,
        msg: '请勿使用明文密码注册',
      }
      return
    }
    // 执行注册
    try {
      const _salt = await bcrypt.genSalt(0)
      let hash = await bcrypt.hash(password, _salt)
      const sql = 'INSERT IGNORE INTO `user` SET username=?, password=?, salt=?'
      await execute(sql, [username, hash, salt])
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
        msg: '注册成功',
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        success: false,
        data: null,
        msg: '未知错误，请重试',
      }
    }
  })

module.exports = router
