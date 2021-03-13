const Router = require('@koa/router')

const router = new Router()

router.prefix('/user')

router
  .get('/', async (ctx, next) => {
    ctx.body = {
      success: true,
      data: ctx.state.userinfo,
      msg: '获取成功',
    }
  })
  .get('/bar', (ctx, next) => {
    ctx.body = 'path /users/bar'
  })

module.exports = router
