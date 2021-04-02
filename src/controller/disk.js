const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const mime = require('mime')
require('dotenv').config

const {
  STATIC_PATH,
  NGINX_HOST,
  NGINX_PORT,
} = process.env

let dir = {}

// 监听文件变动
chokidar.watch(STATIC_PATH)
  .on('add', filePath => {
    let stat = {}
    try {
      stat = fs.statSync(filePath)
    } catch (error) {}
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
      size: stat.size,
      url: `${NGINX_HOST}:${NGINX_PORT}/${filePath}`,
      name: fileName,
    })
  })
  .on('addDir', dirPath => {
    dirPath = path.relative(STATIC_PATH, dirPath)
    if (dirPath == "" && typeof dir['.'] == "undefined") {
      dir['.'] = []
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
      name: dirPath.split('/').pop()
    })
  })
  .on('unlink', filePath => {
    filePath = path.relative(STATIC_PATH, filePath)
    const parentPath = path.dirname(filePath).split(path.sep).join('/')
    filePath = filePath.split(path.sep).join('/')
    for (let i = 0; i <  dir[parentPath].length; i++) {
      if (dir[parentPath][i].url === `${NGINX_HOST}:${NGINX_PORT}/${filePath}`) {
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

class DiskController {
  // 目录内容
  static async disk(ctx, next) {
    if (!ctx.state.userinfo) {
      ctx.body = {
        success: false,
        code: 1,
        msg: '无权限',
      }
      return 
    } 
    const { path = '.' } = ctx.request.query
    console.log(path)
    if (dir[path])  {
      ctx.body = {
        success: true,
        data: dir[path],
        msg: "获取成功",
      }
    } else {
      ctx.body = {
        success: false,
        code: 2,
        msg: "获取失败, 目录不存在",
      }
    }
  }
}

module.exports = DiskController
