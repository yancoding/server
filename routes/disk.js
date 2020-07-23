const Router = require('@koa/router')
const path = require('path')
const chokidar = require('chokidar')
const mime = require('mime')
require('dotenv').config

const {
  PORT,
  STATIC_PATH,
  STATIC_HOST,
} = process.env

const router = new Router()
let dir = {}

// 监听文件变动
chokidar.watch(STATIC_PATH)
  .on('add', p => {
    p = path.relative(STATIC_PATH, p)
    const parentPath = path.dirname(p).split(path.sep).join('/')
    p = p.split(path.sep).join('/')
    if (typeof dir[parentPath] == 'undefined') {
      dir[parentPath] = new Set()
    }
    dir[parentPath].add({
      type: 'file',
      mime: mime.getType(path.extname(p)),
      url: `${STATIC_HOST}:${PORT}/${p}`,
    })
    console.log(dir)
    console.log('--------------------')
  })
  .on('addDir', p => {
    p = path.relative(STATIC_PATH, p)
    if (p == '') {
      return
    }
    const parentPath = path.dirname(p).split(path.sep).join('/')
    p = p.split(path.sep).join('/')
    if (typeof dir[p] == 'undefined') {
      dir[p] = new Set()
    }
    if (typeof dir[parentPath] == 'undefined') {
      dir[parentPath] = new Set()
    }
    dir[parentPath].add({
      type: 'dir',
      path: p,
    })
    console.log(dir)
    console.log('--------------------')
  })
  .on('unlink', p => {
    p = path.relative(STATIC_PATH, p)
    const parentPath = path.dirname(p).split(path.sep).join('/')
    p = p.split(path.sep).join('/')
    dir[parentPath].delete(p)
    console.log(dir)
    console.log('--------------------')
  })
  .on('unlinkDir', p => {
    p = path.relative(STATIC_PATH, p)
    const parentPath = path.dirname(p).split(path.sep).join('/')
    p = p.split(path.sep).join('/')
    delete dir[p]
    dir[parentPath].delete(p)
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
    if (typeof dir[body.dir] === 'undefined') {
      ctx.body = {
        success: false,
        msg: '不存在该目录',
      }
    } else {
      ctx.body = {
        success: true,
        data: dir[body.dir] ? [...dir[body.dir]] : [],
        msg: '获取成功',
      }
    }
  })

module.exports = router
