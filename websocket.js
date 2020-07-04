const WebSocket = require('ws')

// 创建服务
const wss = new WebSocket.Server({
	port: 3000,
})

wss.on('connection', ws => {
  ws.isAlive = true
  // 监听message事件
  ws.on('message', message => {
		// 广播消息
    wss.clients.forEach(client => {
			if (client != ws && client.readyState === WebSocket.OPEN) {
				client.send(message)
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
