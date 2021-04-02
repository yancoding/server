class UserController {
  // 用户信息
  static async user(ctx, next) {
    ctx.body = {
      success: true,
      data: ctx.state.userinfo,
      msg: '获取成功',
    }
  }
}

module.exports = UserController
