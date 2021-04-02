const http = require('http')
const WebSocket = require('ws')
const qs = require('qs')
const jwt = require('jsonwebtoken')
const { query, execute } = require('./mysql')

const server = http.createServer()

// 创建服务
const wss = new WebSocket.Server({
  noServer: true,
})

let roomMap = new Map()
let roomId = 0

// 广播
const broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket. OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

// 群发
const send = (data, ids) => {
  console.log({ data, ids })
  wss.clients.forEach(client => {
    console.log(client.user.id)
    if (
      client.readyState === WebSocket.OPEN &&
      ids.includes(client.user.id)
    ) {
      client.send(JSON.stringify(data))
    }
  })
}

const broadcastOnlineUsers = () => {
  let users = []
  wss.clients.forEach(client => users.push(client.user))
  broadcast({
    type: 'online',
    content: users,
  })
}
// 处理连接事件
const handleConnection = (ws, req) => {
  const { user } = req
  ws.user = user
  ws.together = {
    users: [],
    status: false,
  }
  ws.isAlive = true

  broadcastOnlineUsers()

  // 监听message事件
  ws.on('message', message => {
    message = JSON.parse(message)
    console.log(ws.user, message)
    console.log(roomMap.get(ws.roomId))
    switch(message.type) {
      case 'invite':
        roomId++
        roomMap.set(roomId, [ ws.user.id ])
        ws.roomId = roomId
        send({
          type: message.type,
          from: ws.user,
          roomId,
          video: message.content.video,
        }, [ message.content.userId ])
        break
      case 'acceptInvite':
        console.log('users1: ', roomMap.get(message.roomId))
        let users = roomMap.get(message.roomId)
        users.push(message.user.id)
        console.log('users: ', users)
        roomMap.set(message.roomId, users)
        ws.roomId = message.roomId
        break
      case 'sync':
        if (ws.roomId && roomMap.get(ws.roomId).length > 1) {
          send(message, roomMap.get(ws.roomId).filter(id => id != ws.user.id))
        }
        break
    }
	})
  
  // 监听pong事件
  ws.on('pong', () => {
    ws.isAlive = true
  })

  // 连接关闭
  ws.on('close', () => {
    broadcastOnlineUsers()
  })
}

const getUserinfo = async token => {
  let userinfo = null
  try {
    let { username } = await jwt.verify(token, 'my secret')
    const rows = await query('SELECT * FROM `user` WHERE `username` = ?', [username])
    const { id, sex } = rows[0]
    userinfo = { id, username, sex }
  } catch (error) {
  }
  return userinfo
}

// 处理upgrade事件
const handleUpgrade = async (req, socket, head) => {
  const queryString = req.url.split('?').pop()
  const { token } = qs.parse(queryString)

  const userinfo = await getUserinfo(token.split(' ').pop())
  if (userinfo) {
    req.user = userinfo
    console.log('ws login: ', userinfo)
  } else {
    console.log('ws: 未登录')
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit('connection', ws, req)
  })
}

server.on('upgrade', handleUpgrade)

wss.on('connection', handleConnection)

// 心跳定时器（30s）（异常中断）
const interval = setInterval(() => {
  // 遍历所有连接
  wss.clients.forEach(ws => {
    // 活跃连接，发送ping
    // 失活连接，关闭该连接
    if (ws.isAlive) {
      ws.isAlive = false
      ws.ping()
    } else {
      ws.terminate()
      broadcastOnlineUsers()
    }
  })
}, 30 * 1000)

// 服务关闭时，清除心跳定时器
wss.on('close', () => {
  clearInterval(interval)
})

module.exports = server
