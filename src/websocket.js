const jwt = require('jsonwebtoken')
const { query, execute } = require('./mysql')

const httpServer = require('http').createServer()
const io = require('socket.io')(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"]
  }
})

const { TOKEN_SECRET } = process.env

const socketMap = new Map()

// 中间件 是否登录
io.use(async (socket, next) => {
  try {
    const userId = jwt.verify(socket.handshake.auth.token, TOKEN_SECRET).id
    const [ user ] = await execute('select id, username name, sex from user where id = ?', [ userId ])
    socket.userId = userId
    socketMap.set(socket.id, user)
    next()
  } catch (err) {
    next(new Error('no login'))
  }
})

io.on('connection', async socket => {
  io.emit('user_list_update', [ ...socketMap.values() ])
  console.log(socketMap)
  // console.log('count: ', io.engine.clientsCount)
  // const ids = await io.allSockets()
  // console.log({ ids })

  socket.on('disconnect', reason => {
    io.emit('user_list_update', [ ...socketMap.values() ])
    socketMap.delete(socket.id)
    // console.log('disconnect', reason)
  })

  socket.on('chat', (message, userId, callback) => {
    if (typeof callback === 'function') {
      callback({
        success: true,
      })
    }
  })
})

module.exports = httpServer
