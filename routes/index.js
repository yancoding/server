const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const koaBody = require('koa-body')
const path = require('path')
const { promises: fsPromises } = require('fs')
const router = new Router()
const { query, execute } = require('../mysql')
let userList = ['yan']

const {
  UPLOAD_PATH,
  NGINX_HOST,
  NGINX_PORT,
} = process.env

router
  .post('/', async (ctx, next) => {
    const { id } = ctx.state.userinfo
    const rows = await query('SELECT * FROM `file` WHERE `user_id` = ?', [id])
    let data = rows.map(file => {
      return {
        id: file.id,
        name: file.name,
        url: `${NGINX_HOST}:${NGINX_PORT}/upload/${path.basename(file.path)}`,
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
      maxFileSize: 500 * 1024 * 1024,
    },
  }), async (ctx, next) => {
    // console.log(ctx.request.files.file)
    const { size, path: filePath, name, type, lastModifiedDate } = ctx.request.files.file
    const { id: userid } = ctx.state.userinfo
    const sql = 'INSERT IGNORE INTO `file` SET name=?, ext_name=?, path=?, user_id=?'
    await execute(sql, [ name, type, path.basename(filePath), userid ])
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
    const [ file ] = await execute('SELECT path FROM `file` WHERE id=?', [ fileId ])
    try {
      await fsPromises.unlink(path.join(UPLOAD_PATH, file.path))
      await execute('DELETE FROM `file` WHERE id=?', [ fileId ])
    } catch (error) {
      ctx.body = {
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
