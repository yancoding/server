const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, execute } = require('../mysql')
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
  .post('/salt', async (ctx, next) => {
    const { username } = ctx.request.body
    if (typeof username === 'undefined') {
      ctx.body = {
        success: false,
        data: null,
        msg: '未指定查询参数[username]',
      }
    } else {
      const sql = 'SELECT `salt` FROM `user` WHERE `username`=?'
      const rows = await execute(sql, [username])
      console.log(rows)
      if (rows.length === 0) {
        ctx.body = {
          success: false,
          data: null,
          msg: '用户不存在'
        }
      } else {
        ctx.body = {
          success: true,
          data: {
            salt: rows[0].salt
          },
          msg: '查询成功',
        }
      }
    }
    
    
  })

module.exports = router
