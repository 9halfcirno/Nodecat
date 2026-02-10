import http from 'http';
import {WebSocketServer} from 'ws';

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>WebSocket Console with Colors</h1>');
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server });

// 处理客户端连接
wss.on('connection', ws => {
  console.log('A client connected');
  
  // 重写 console.log，将输出转发到 WebSocket 客户端
  const originalLog = console.log;
  console.log = function (...args) {
    originalLog(...args);  // 保持原有的 console.log 行为
    const message = args.join(' ');
    ws.send(message);  // 发送带有ANSI颜色的日志到 WebSocket 客户端
  };

  ws.on('close', () => {
    console.log('A client disconnected');
  });
});

// 启动服务器
server.listen(8080, () => {
  console.log('Server is running on ws://localhost:8080');
});