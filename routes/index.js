const Router = require('@koa/router')

const router = new Router()

router
  .get('/', async (ctx, next) => {
    ctx.body = {
      name: 'yan',
      age: 3,
    }
  })
  .get('/string', async (ctx, next) => {
    ctx.body = 'path /string'
  })

module.exports = router
