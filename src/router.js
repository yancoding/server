const Router = require('@koa/router')
const koaBody = require('koa-body')
const indexCtrl = require('./controller/index')
const fileCtrl = require('./controller/file')
const diskCtrl = require('./controller/disk')
const loginCtrl = require('./controller/login')
const userCtrl = require('./controller/user')
const registerCtrl = require('./controller/register')

const router = new Router()

router
  .get('/', indexCtrl.index)

router
  .get('/file', fileCtrl.file)
  .get('/file/classify', fileCtrl.fileClassify)
  .get('/file/carousel', fileCtrl.carousel)
  .get('/file/movie', fileCtrl.movie)
  .get('/file/ustv', fileCtrl.usTv)
  .get('/file/mv', fileCtrl.mv)
  .post('/file/upload', koaBody(fileCtrl.koaBodyOptions), fileCtrl.upload)
  .post('/file/delete', fileCtrl.delete)
  .put('/file', fileCtrl.put)

router
  .get('/disk', diskCtrl.disk)

router
  .post('/login/salt', loginCtrl.salt)
  .post('/login', loginCtrl.login)

router
  .get('/user', userCtrl.user)

router
  .get('/register', registerCtrl.register)


module.exports = router
