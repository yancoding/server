const path = require('path')
const fs = require('fs')
const { promises: fsPromises, fstatSync } = require('fs')
const { query, execute } = require('../mysql')
const ffmpegPath = require('ffmpeg-static');
const ffprope = require('ffprobe-static')
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprope.path)

const {
  UPLOAD_PATH,
  NGINX_HOST,
  NGINX_PORT,
  STATIC_PATH,
} = process.env

// 文件分类
const classifyMap = new Map([
  [1, '电影'],
  [2, '美剧'],
  [3, '音乐']
])


// 获取视频缩略图
const screenshot = (filePath) => {
  let thumbnailName = ''
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .on('filenames', names => {
        thumbnailName = names[0]
      })
      .on('end', () => {
        resolve(thumbnailName)
      })
      .on('error', err => {
        reject(err)
      })
      .screenshots({
        count: 1,
        folder: path.join(STATIC_PATH, './thumbnail'),
        filename: '%b-%r',
        size: '320x?'
      })
  })
}

// 获取视频时长
const getVideoDuration = filePath => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
      } else {
        resolve(metadata.format.duration)
      }
    })
  })
}

class FileController {
  // 获取文件
  static async file(ctx, next) {
    if (!ctx.state.userinfo) {
      return ctx.body = {
        success: false,
        data: null,
        msg: '未登录',
      }
    }
    const { id: userId } = ctx.state.userinfo
    let { id: fileId, page = 1, size = 10 } = ctx.request.query
    page = Number(page)
    size = Number(size)
    const offset = (page -1) * size
    if (fileId) {
      const rows = await query('select file.*, user.username from file as file join user as user on file.id = ? and user.id = ? and file.user_id = user.id;', [ fileId, userId ])
      const file = rows[0] || {}
      ctx.body = {
        success: true,
        data: {
          id: file.id,
          name: file.name,
          url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
          thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
          type: file.ext_name,
          duration: file.duration,
          uploader: file.username,
          classify: file.classify,
          classifyName: classifyMap.get(Number(file.classify)),
        },
        msg: '获取成功',
      }
    } else {
      const rows = await query('select file.*, user.username from file as file join user as user on user.id = ? and file.user_id = user.id limit ?, ?;', [ userId, offset, size ])
      const [ { total } ] = await query('select count(*) as total from file where user_id = ?;', [ userId ])
      let content = rows.map(file => {
        return {
          id: file.id,
          name: file.name,
          url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
          thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
          type: file.ext_name,
          duration: file.duration,
          uploader: file.username,
          classify: file.classify,
          classifyName: classifyMap.get(Number(file.classify)),
        }
      })
      ctx.body = {
        success: true,
        data: {
          content,
          page,
          size,
          total,
        },
        msg: '获取成功',
      }
    }
  }

  // koaBody options
  static koaBodyOptions = {
    multipart: true,
    onError(err) {
      console.log('koa body error: ', err)
    },
    formidable: {
      uploadDir: path.join(UPLOAD_PATH),
      keepExtensions: true,
      maxFieldsSize: 0,
      onFileBegin(name, file) {
        console.log(`上传目录：${path.join(UPLOAD_PATH)}`)
        // console.log({ name, file })
      },
      maxFileSize: 1024 * 1024 * 1024,
    },
  }

  // 上传文件
  static async upload(ctx, next) {
    // console.log(ctx.request.files.file)
    const { size, path: filePath, name, type, lastModifiedDate } = ctx.request.files.file
    const thumbnailName = await screenshot(filePath)
    const duration = await getVideoDuration(filePath)
    const { id: userid } = ctx.state.userinfo
    const sql = 'INSERT IGNORE INTO `file` SET name=?, ext_name=?, path=?, user_id=?, thumbnail=?, duration=?'
    await execute(sql, [ name, type, path.basename(filePath), userid, thumbnailName, duration ])
    ctx.body = {
      success: true,
      data: {
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(filePath)}`,
      },
      msg: '上传成功',
    }
  }

  // 更新文件信息
  static async put(ctx, next) {
    const { file, files, classify } = ctx.request.body
    if (file) {

    } else if (files.length) {
      files.forEach(async item => {
        await execute('UPDATE file SET classify = ? where id = ?;', [ classify, item])
      })
      ctx.body = {
        success: true,
        data: {},
        msg: '更新成功',
      }
    }
  }

  // 删除文件
  static async delete(ctx, next) {
    const { id: fileId } = ctx.request.body
    const [ file ] = await execute('SELECT * FROM `file` WHERE id=?', [ fileId ])
    const filePath = path.join(UPLOAD_PATH, file.path)
    const thumbnailPath = path.join(STATIC_PATH, './thumbnail', file.thumbnail)
    try {
      fs.existsSync(filePath) && await fsPromises.unlink(filePath)
      fs.existsSync(thumbnailPath) && await fsPromises.unlink(thumbnailPath)
      await execute('DELETE FROM `file` WHERE id=?', [ fileId ])
    } catch (error) {
      return ctx.body = {
        success: false,
        data: {},
        msg: '删除失败',
      }
    }
    ctx.body = {
      success: true,
      data: {},
      msg: '删除成功',
    }
  }

  // 获取文件分类
  static async fileClassify(ctx, next) {
    let data = []
    classifyMap.forEach((value, key) => {
      data.push({
        label: value,
        value: key,
      })
    })
    data.push({
      label: '其他',
      value: '0',
    })

    ctx.body = {
      success: true,
      data,
      msg: '获取成功',
    }
  }

  // 获取首页电影及排行榜
  static async movie(ctx, next) {
    let classify = 1
    let videoList = await query('SELECT file.*, user.username FROM file as file join user as user on file.user_id = user.id AND file.classify = ? limit 0, 10;', [ classify ])
    let rankList = await query('SELECT file.*, user.username FROM file as file join user as user on file.user_id = user.id AND file.classify = ? limit 0, 10;', [ classify ])
    
    videoList = videoList.map(file => {
      return {
        id: file.id,
        name: file.name,
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
        thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
        type: file.ext_name,
        duration: file.duration,
        uploader: file.username, 
        classify: file.classify,
        classifyName: classifyMap.get(Number(file.classify)),
      }
    })
    
    rankList = rankList.map(file => {
      return {
        id: file.id,
        name: file.name,
      }
    })

    ctx.body = {
      success: true,
      data: {
        classify,
        videoList,
        rankList,
      },
      msg: '获取成功',
    }
  }

  // 获取首页美剧及排行榜
  static async usTv(ctx, next) {
    let classify = 2
    let videoList = await query('SELECT file.*, user.username FROM file as file join user as user on file.user_id = user.id AND file.classify = ? limit 0, 10;', [ classify ])
    let rankList = await query('SELECT file.*, user.username FROM file as file join user as user on file.user_id = user.id AND file.classify = ? limit 0, 10;', [ classify ])
    
    videoList = videoList.map(file => {
      return {
        id: file.id,
        name: file.name,
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
        thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
        type: file.ext_name,
        duration: file.duration,
        uploader: file.username, 
        classify: file.classify,
        classifyName: classifyMap.get(Number(file.classify)),
      }
    })
    
    rankList = rankList.map(file => {
      return {
        id: file.id,
        name: file.name,
      }
    })

    ctx.body = {
      success: true,
      data: {
        classify,
        videoList,
        rankList,
      },
      msg: '获取成功',
    }
  }

  // 获取首页mv及排行榜
  static async mv(ctx, next) {
    let classify = 3
    let videoList = await query('SELECT file.*, user.username FROM file as file join user as user on file.user_id = user.id AND file.classify = ? limit 0, 10;', [ classify ])
    let rankList = await query('SELECT file.*, user.username FROM file as file join user as user on file.user_id = user.id AND file.classify = ? limit 0, 10;', [ classify ])
    
    videoList = videoList.map(file => {
      return {
        id: file.id,
        name: file.name,
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
        thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
        type: file.ext_name,
        duration: file.duration,
        uploader: file.username, 
        classify: file.classify,
        classifyName: classifyMap.get(Number(file.classify)),
      }
    })
    
    rankList = rankList.map(file => {
      return {
        id: file.id,
        name: file.name,
      }
    })

    ctx.body = {
      success: true,
      data: {
        classify,
        videoList,
        rankList,
      },
      msg: '获取成功',
    }
  }

  // 首页轮播
  static async carousel(ctx, next) {
    const rows = await execute('SELECT id, name, thumbnail FROM file LIMIT 0, 5;')
    let content = rows.map(file => {
      return {
        id: file.id,
        name: file.name,
        thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
      }
    })
    ctx.body = {
      success: true,
      data: content,
      msg: '获取成功',
    }
  }
}

module.exports = FileController
