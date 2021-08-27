class UserController {
  // 用户信息
  static async user(ctx, next) {
    const userInfo = ctx.state.userinfo
    if (!userInfo)  {
      ctx.body = {
        success: false,
        data: null,
        msg: '未登录',
      }
      return
    }

    ctx.body = {
      success: true,
      data: userInfo,
      msg: '获取成功',
    }
  }
}

module.exports = UserController
