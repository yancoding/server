const Router = require('@koa/router')
const koaBody = require('koa-body')
const path = require('path')
const fs = require('fs')
const { promises: fsPromises, fstatSync } = require('fs')
const router = new Router()
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

router
  .post('/', async (ctx, next) => {
    const { id } = ctx.state.userinfo
    const rows = await query('SELECT * FROM `file` WHERE `user_id` = ?', [id])
    let data = rows.map(file => {
      return {
        id: file.id,
        name: file.name,
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
        thumbnail: `${NGINX_HOST}:${NGINX_PORT}/thumbnail/${path.basename(file.thumbnail)}`,
        type: file.ext_name,
      }
    })
    ctx.body = {
      success: true,
      data,
      msg: '获取成功',
    }
  })
  .get('/string', async (ctx, next) => {
    ctx.body = 'path /string'
  })
  .post('/upload', koaBody({
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
  }), async (ctx, next) => {
    // console.log(ctx.request.files.file)
    const { size, path: filePath, name, type, lastModifiedDate } = ctx.request.files.file
    const thumbnailName = await screenshot(filePath)
    const { id: userid } = ctx.state.userinfo
    const sql = 'INSERT IGNORE INTO `file` SET name=?, ext_name=?, path=?, user_id=?, thumbnail=?'
    await execute(sql, [ name, type, path.basename(filePath), userid, thumbnailName ])
    ctx.body = {
      success: true,
      data: {
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(filePath)}`,
      },
      msg: '上传成功',
    }
  })
  .post('/delete', async (ctx, next) => {
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
  })

module.exports = router
