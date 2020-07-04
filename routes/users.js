const Router = require('@koa/router')

const router = new Router()

router.prefix('/users')

router
  .get('/', async (ctx, next) => {
    ctx.body = 'path /users'
  })
  .get('/bar', (ctx, next) => {
    ctx.body = 'path /users/bar'
  })

module.exports = router
