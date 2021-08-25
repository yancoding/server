const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, execute } = require('../mysql')

const { TOKEN_EXPIRES, TOKEN_SECRET } = process.env

class LoginController {
  // 获取盐值
  static async salt(ctx, next) {
    const { username } = ctx.request.body
    if (typeof username === 'undefined') {
      return ctx.body = {
        success: false,
        code: 1,
        msg: '未指定查询参数[username]',
      }
    }

    const [ user ] = await execute('SELECT `salt` FROM `user` WHERE `username` = ?', [ username ])
    if (typeof user === 'undefined') {
      ctx.body = {
        success: false,
        code: 2,
        msg: '用户不存在',
      }
    } else {
      ctx.body = {
        success: true,
        data: {
          salt: user.salt,
        },
        msg: '查询成功',
      }
    }
  }

  // 登录
  static async login(ctx, next) {
    const { username, password } = ctx.request.body

    if (
      typeof username === 'undefined' ||
      typeof password === 'undefined'
    ) {
      return ctx.body = {
        success: false,
        code: 1,
        msg: '未找到参数[username, password]',
      }
    } 

    const [ user ] = await query('SELECT `id`, `password` FROM `user` WHERE `username` = ?', [ username ])
    if (typeof user === 'undefined') {
      return ctx.body = {
        success: false,
        code: 2,
        msg: '用户不存在',
      }
    }

    const { id, password: hash } = user
    if (await bcrypt.compare(password, hash)) {
      // 生成token
      const token = jwt.sign({ id, username }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRES })
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

module.exports = LoginController
