const http = require('http')
const WebSocket = require('ws')

const server = http.createServer()

// 创建服务
const wss = new WebSocket.Server({
  server,
})

wss.on('connection', ws => {
  ws.isAlive = true
  // 监听message事件
  ws.on('message', message => {
		// 广播消息
    const data = {
      date: Date.now(),
      content: message,
      user: {
        name: '苍余生',
        avatar: 'http://img1.imgtn.bdimg.com/it/u=2034740944,4251903193&fm=26&gp=0.jpg',
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
