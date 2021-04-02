const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, execute } = require('../mysql')

const { TOKEN_EXPIRES } = process.env

class LoginController {
  // 获取盐值
  static async salt(ctx, next) {
    const { username } = ctx.request.body
    if (username === undefined) {
      ctx.body = {
        success: false,
        code: 1,
        msg: '未指定查询参数[username]',
      }
    } else {
      const sql = 'SELECT `salt` FROM `user` WHERE `username`=?'
      const rows = await execute(sql, [username])
      if (rows.length === 0) {
        ctx.body = {
          success: false,
          code: 2,
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
  }

  // 登录
  static async login(ctx, next) {
    const { username, password } = ctx.request.body

    if (
      username === undefined ||
      password === undefined
    ) {
      ctx.body = {
        success: false,
        code: 1,
        msg: '未找到参数[username, password]',
      }
      return
    } 

    const rows = await query('SELECT * FROM `user` WHERE `username` = ?', [username])
    if (rows.length === 0) {
      ctx.body = {
        success: false,
        code: 2,
        msg: '用户不存在',
      }
    } else {
      let hash = rows[0].password
      if (await bcrypt.compare(password, hash)) {
          const payload = {
            username
          }
          const secret = 'my secret'
          const token = jwt.sign(payload, secret, { expiresIn: TOKEN_EXPIRES })
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
    }
  }
}

module.exports = LoginController
