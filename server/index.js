import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const app = express();
const httpServer = createServer(app);
const port = 2233;

// 启动参数数组
const args = process.argv.slice(2);
// 通过检查启动参数数组中是否包含dev字符串判断是否处于开发环境
// 开发环境使用package.json中的dev启动命令，该命令后面包含dev参数
const isDevEnv = args.includes('dev');

// 托管静态资源
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'static')));

// 处理前端路由（支持 SPA）
app.get('*', (req, res) => {
  console.log('request to /: ', req.url);
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

const io = new Server(httpServer, {
  cors: {
    // origin: "https://example.com",
    allowedHeaders: ["*"],
    credentials: true
  }
});
io.on('connection', (socket) => {

  const remoteUser = socket.request.socket.remoteAddress + ':' + socket.request.socket.remotePort;

  console.log('来自' + remoteUser + '的新连接');

  socket.on('disconnect', function () {
    console.log('用户' + remoteUser + '断开连接');
  });

  socket.on('video-control', (controlParam) => {
    // console.log('用户' + remoteUser + '的消息:' + controlParam);
    debugLog('用户', remoteUser, '的消息:', controlParam);
    io.emit('video-control', controlParam);
  });

  // 转发同步字幕的事件
  socket.on('sync-subtitle', (...controlParam) => {
    debugLog('用户', remoteUser, '的消息:', ...controlParam);
    io.emit('sync-subtitle', ...controlParam);
  })

});

httpServer.listen(port, () => {
  console.log('正在监听端口：' + port);
});

/**
 * 根据当前运行环境打印日志。
 * 当为开发环境时才打印日志
 * @param  {...any} args 多个要输出的参数，最终连接为一个字符串输出
 */
function debugLog(...args) {
  if (isDevEnv) {
    console.log(args.join(''));
  }
}