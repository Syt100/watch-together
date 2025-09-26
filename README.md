# Watch Together

一个支持多人同步观影的Web应用，让远程的朋友们能够同步观看视频内容。

## 功能特点

- 🎬 **实时同步** - 播放、暂停、跳转等操作实时同步到所有观看者
- 📱 **多设备支持** - 支持桌面端和移动端浏览器
- 🎞️ **多格式支持** - 支持 HLS、DASH、MPEG-TS 等主流视频流格式
- 📝 **字幕同步** - 支持字幕文件的实时同步
- ⚙️ **高级设置** - 可自定义播放器配置和字幕设置
- 🐳 **容器化部署** - 支持 Docker 一键部署

## 技术栈

### 前端
- **Vue 3** - 现代化的前端框架
- **Vite** - 快速的构建工具
- **ArtPlayer** - 功能强大的视频播放器
- **Socket.IO** - 实时通信
- **Pinia** - 状态管理
- **Naive UI** - 组件库

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 服务框架
- **Socket.IO** - WebSocket 服务

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

1. **克隆项目**
```bash
git clone <repository-url>
cd watch-together
```

2. **安装依赖**
```bash
# 安装客户端依赖
cd client
npm install

# 安装服务端依赖
cd ../server
npm install
```

3. **开发模式运行**
```bash
# 在项目根目录下同时启动客户端和服务端
npm run dev
```

4. **访问应用**
打开浏览器访问：`http://localhost:5173`

### 生产环境部署

#### 方式一：手动构建

1. **构建前端**
```bash
npm run build
```

2. **启动服务**
```bash
cd server
npm start
```

3. **访问应用**
访问：`http://localhost:2233`

#### 方式二：Docker 部署

1. **构建镜像**
```bash
docker build -t watch-together .
```

2. **运行容器**
```bash
docker run -p 2233:2233 watch-together
```

3. **访问应用**
访问：`http://localhost:2233`

## 使用说明

### 视频格式支持

应用支持以下视频流格式：
- **HLS** (.m3u8) - HTTP Live Streaming
- **DASH** (.mpd) - Dynamic Adaptive Streaming
- **MPEG-TS** - MPEG传输流
- **MP4** - 标准视频文件

### 如何使用

1. **启动应用** - 按照上面的快速开始步骤启动服务
2. **输入视频地址** - 在播放器界面输入支持的视频流 URL
3. **邀请朋友** - 分享应用地址给朋友们
4. **同步观影** - 任何人的播放操作都会同步到所有连接的用户

### 高级功能

- **字幕支持** - 可以上传字幕文件并同步显示
- **播放器设置** - 支持自定义播放器配置
- **移动端适配** - 完美支持手机和平板设备

## 常见问题

### Q: 如何添加新的视频源？
A: 在播放器界面直接输入支持的视频流 URL 即可。

### Q: 为什么视频不同步？
A: 请检查网络连接，确保所有用户都连接到同一个服务器实例。

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器，包括 Chrome、Firefox、Safari、Edge 等。

### Q: 如何自定义播放器设置？
A: 在应用界面中点击设置按钮，可以调整播放器和字幕相关配置。

## 开发贡献

欢迎参与项目开发！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细的开发指南。

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 支持

如果您在使用过程中遇到问题或有功能建议，请：

1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue 描述问题或建议
3. 参与社区讨论

---

**享受同步观影的乐趣！** 🎬✨