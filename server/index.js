const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const port = 2233;

httpServer.listen(port, () => {
  console.log('正在监听端口：' + port);
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
    console.log('用户' + remoteUser + '的消息:' + controlParam);
    io.emit('video-control', controlParam);
  });

});
