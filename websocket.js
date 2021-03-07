const http = require('http')
const WebSocket = require('ws')
const qs = require('qs')
const jwt = require('jsonwebtoken')

const server = http.createServer()

// 创建服务
const wss = new WebSocket.Server({
  noServer: true,
})

wss.on('connection', (ws, req) => {
  ws.isAlive = true
  // 监听message事件
  ws.on('message', message => {
		// 广播消息
    const data = {
      date: Date.now(),
      content: message,
      user: {
        id: 2,
        name: '苍余生',
        avatar: 'https://dss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1354268575,1268995723&fm=26&gp=0.jpg',
      },
    }
    wss.clients.forEach(client => {
			if (client != ws && client.readyState === WebSocket.OPEN) {
			  client.send(JSON.stringify(data))
      }
		})		
	})
  
  // 监听pong事件
  ws.on('pong', () => {
    ws.isAlive = true
  })
})

server.on('upgrade', async (req, socket, head) => {
  const queryString = req.url.split('?').pop()
  const { token } = qs.parse(queryString)
  try {
    const { username } = await jwt.verify(token.split(' ').pop(), 'my secret')
  } catch (error) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit('connection', ws, req)
  })
})

// 心跳定时器（30s）
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
    }
  })
}, 30000)

// 服务关闭时，清除心跳定时器
wss.on('close', () => {
  clearInterval(interval)
})

module.exports = server
