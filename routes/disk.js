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
  .on('add', filePath => {
    filePath = path.relative(STATIC_PATH, filePath)
    const parentPath = path.dirname(filePath).split(path.sep).join('/')
    const fileName = path.basename(filePath)
    filePath = filePath.split(path.sep).join('/')
    if (typeof dir[parentPath] == 'undefined') {
      dir[parentPath] = []
    }
    dir[parentPath].push({
      type: 'file',
      mime: mime.getType(path.extname(filePath)),
      url: `${STATIC_HOST}:${PORT}/${filePath}`,
      name: fileName,
    })
  })
  .on('addDir', dirPath => {
    dirPath = path.relative(STATIC_PATH, dirPath)
    if (dirPath == '') {
      return
    }
    const parentPath = path.dirname(dirPath).split(path.sep).join('/')
    dirPath = dirPath.split(path.sep).join('/')
    if (typeof dir[dirPath] == 'undefined') {
      dir[dirPath] = []
    }
    if (typeof dir[parentPath] == 'undefined') {
      dir[parentPath] = []
    }
    dir[parentPath].push({
      type: 'dir',
      path: dirPath,
    })
  })
  .on('unlink', filePath => {
    filePath = path.relative(STATIC_PATH, filePath)
    const parentPath = path.dirname(filePath).split(path.sep).join('/')
    filePath = filePath.split(path.sep).join('/')
    for (let i = 0; i <  dir[parentPath].length; i++) {
      if (dir[parentPath][i].url === `${STATIC_HOST}:${PORT}/${filePath}`) {
        dir[parentPath].splice(i, 1)
      }
    }
  })
  .on('unlinkDir', dirPath => {
    dirPath = path.relative(STATIC_PATH, dirPath)
    const parentPath = path.dirname(dirPath).split(path.sep).join('/')
    dirPath = dirPath.split(path.sep).join('/')
    delete dir[dirPath]
    for (let i = 0; i < dir[parentPath].length; i++) {
      if (dir[parentPath][i].path === dirPath) {
        dir[parentPath].splice(i, 1)
        break
      }
    }
  })

router.prefix('/disk')

router
  .get('/', async (ctx, next) => {
    ctx.body = 'disk'
  })
  .post('/dir', async (ctx, next) => {
    const body = ctx.request.body
    ctx.body = {
      success: true,
      data: dir[body.dir] ? dir[body.dir] : [],
      msg: '获取成功',
    }
  })

module.exports = router
