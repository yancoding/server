const Router = require('@koa/router')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
require('dotenv').config

const router = new Router()
let dir = {}
chokidar.watch('../static')
  .on('all', (e, p) => {
    p = path.relative('../static', p)
    // ../static目录丢弃
    if (p == '') {
      return
    }
    const parentPath = path.dirname(p).split(path.sep).join('/')
    p = p.split(path.sep).join('/')
    
    // p && dir[path.dirname(p)].add(`http://localhost:${process.env.API_PORT}/${p}`)
    
    switch(e) {
      case 'add':
        if (typeof dir[parentPath] == 'undefined') {
          dir[parentPath] = new Set()
        }
        dir[parentPath].add(p)
        break
      case 'addDir':
        if (typeof dir[p] == 'undefined') {
          dir[p] = new Set()
        }
        if (typeof dir[parentPath] == 'undefined') {
          dir[parentPath] = new Set()
        }
        dir[parentPath].add(p)
        break
      case 'unlink':
        dir[parentPath].delete(p)
        break
      case 'unlinkDir':
        delete dir[p]
        dir[parentPath].delete(p)
        break
    }
    console.log(dir)
    console.log('--------------------')
  })
router.prefix('/disk')

router
  .get('/', async (ctx, next) => {
    ctx.body = 'disk'
  })
  .post('/dir', async (ctx, next) => {
    const body = ctx.request.body
    // const dir = await fs.promises.opendir(path.join('../', body.dir));
    // let dirList = []
    // for await (const dirent of dir) {
    //   dirList.push(dirent.name)
    // }
    ctx.body = dir[body.dir] ? [...dir[body.dir]] : []
  })

module.exports = router
