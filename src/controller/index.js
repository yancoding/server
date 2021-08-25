const { API_PORT, TOKEN_SECRET } = process.env

class IndexController {
  static async index(ctx, next) {
    const host = ctx.header.host
    ctx.body = {
      success: true,
      data: {
        file: `http://${host}/file`,
      },
      msg: '获取成功',
    }
  }
}

module.exports = IndexController