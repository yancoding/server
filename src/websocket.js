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

// 连接map
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
    socketMap.delete(socket.id)
    io.emit('user_list_update', [ ...socketMap.values() ])
    console.log('连接断开: ', reason)
  })

  socket.on('chat', (userId, message, callback) => {
    const user = socketMap.get(socket.id)
    if (typeof callback === 'function') {
      callback({
        success: true,
        data: {
          user,
          date: Date.now(),
          content: message,
        },
        msg: '发送成功',
      })
    }
  })
})

module.exports = httpServer
