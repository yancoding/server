const Router = require('@koa/router')
const fs = require('fs')
const path = require('path')

const router = new Router()

router.prefix('/disk')

router
  .get('/', async (ctx, next) => {
    ctx.body = 'disk'
  })
  .post('/dir', async (ctx, next) => {
    const body = ctx.request.body
    const dir = await fs.promises.opendir(path.join('../', body.dir));
    let dirList = []
    for await (const dirent of dir) {
      dirList.push(dirent.name)
    }
    ctx.body = dirList
  })

module.exports = router
