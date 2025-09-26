# 贡献指南

感谢您对 Watch Together 项目的关注！我们欢迎所有形式的贡献，包括但不限于代码提交、问题报告、功能建议和文档改进。

## 开发环境设置

### 环境要求

- Node.js 18+
- npm 或 yarn
- Git

### 项目结构

```
watch-together/
├── client/              # 前端项目
│   ├── src/
│   │   ├── api/         # API 接口
│   │   ├── components/  # Vue 组件
│   │   ├── stores/      # Pinia 状态管理
│   │   ├── utils/       # 工具函数
│   │   └── views/       # 页面组件
│   ├── scripts/         # 构建脚本
│   └── package.json
├── server/              # 后端项目
│   ├── index.js         # 服务端入口
│   └── package.json
├── Dockerfile          # Docker 配置
└── package.json        # 根目录包配置
```

### 本地开发设置

1. **Fork 并克隆项目**
```bash
git clone https://github.com/your-username/watch-together.git
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

3. **启动开发服务器**
```bash
# 在项目根目录下同时启动前后端
npm run dev
```

## 开发指南

### 可用命令

**根目录命令：**
- `npm run dev` - 同时启动前后端开发服务器
- `npm run dev:client` - 仅启动前端开发服务器
- `npm run dev:server` - 仅启动后端开发服务器
- `npm run build` - 构建生产版本

**客户端命令：**
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 代码检查和格式化
- `npm run preview` - 预览构建结果

**服务端命令：**
- `npm start` - 启动生产服务器
- `npm run dev` - 启动开发服务器（带调试日志）

### 核心功能实现

#### 实时同步机制

应用使用 Socket.IO 实现实时同步：

1. **视频控制事件** (`video-control`)
   - 播放/暂停
   - 跳转进度
   - 音量调节

2. **字幕同步事件** (`sync-subtitle`)
   - 字幕文件切换
   - 字幕偏移调整

#### 状态管理

使用 Pinia 管理应用状态：
- `watchConfig` - 观影配置（`client/src/stores/watchConfig.js:1`）
- `subtitleConfig` - 字幕设置（`client/src/stores/subtitleConfig.js:1`）

状态自动持久化到本地存储。

#### 网络配置

- **开发环境**: 前端端口 5173，后端端口 2233
- **生产环境**: 统一端口 2233
- **WebSocket**: 使用 Socket.IO 进行实时通信

## 代码规范

### 前端代码规范

- 使用 Vue 3 Composition API
- 遵循 ESLint 配置的代码风格
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

### 后端代码规范

- 使用 ES6+ 语法
- 使用 ESM 模块系统
- 函数和变量使用 camelCase 命名

### 提交规范

使用约定式提交格式：

```
<type>: <description>

[optional body]

[optional footer(s)]
```

**类型 (type)：**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建或辅助工具的变动

**示例：**
```
feat: 添加视频倍速播放功能

- 在播放器控件中添加倍速选择按钮
- 支持0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x倍速
- 倍速变化时同步到所有客户端
```

## 贡献流程

### 1. 创建 Issue

在开始开发之前，请先创建一个 Issue 来描述你要解决的问题或添加的功能。这有助于：
- 确保该功能/修复是需要的
- 避免重复工作
- 获得维护者和社区的反馈

### 2. 开发流程

1. **创建功能分支**
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

2. **开发和测试**
- 确保代码符合项目的编码规范
- 运行 `npm run lint` 检查代码风格
- 测试您的更改在不同浏览器中的兼容性

3. **提交更改**
```bash
git add .
git commit -m "feat: 您的功能描述"
```

4. **推送分支**
```bash
git push origin feature/your-feature-name
```

### 3. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写 PR 模板中的相关信息
3. 确保 PR 描述清晰地说明了更改的内容和原因
4. 链接相关的 Issue（如果有）

### 4. 代码审查

- 维护者会审查您的 PR
- 根据反馈进行必要的修改
- 所有检查通过后，PR 将被合并

## 测试指南

### 功能测试

在提交 PR 之前，请确保测试以下功能：

1. **基本播放功能**
   - 视频加载和播放
   - 播放/暂停控制
   - 进度条拖拽

2. **同步功能**
   - 多个浏览器标签页的同步
   - 网络断开重连后的同步恢复

3. **字幕功能**
   - 字幕文件上传和显示
   - 字幕偏移调整

4. **响应式设计**
   - 桌面端浏览器
   - 移动端浏览器

### 浏览器兼容性

请在以下浏览器中测试：
- Chrome（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- Edge（最新版本）

## 问题报告

### 如何报告 Bug

1. 搜索现有 Issues，确认问题未被报告过
2. 创建新的 Issue，使用 Bug 报告模板
3. 提供详细信息：
   - 操作系统和浏览器版本
   - 重现步骤
   - 预期行为和实际行为
   - 截图或视频（如适用）
   - 控制台错误信息

### 功能建议

1. 搜索现有 Issues，确认建议未被提出过
2. 创建新的 Issue，使用功能请求模板
3. 清楚描述：
   - 功能的用途和价值
   - 详细的实现建议
   - 可能的替代方案

## 获取帮助

如果您在贡献过程中遇到问题：

1. 查看项目的 [README.md](README.md)
2. 搜索现有的 [Issues](../../issues)
3. 创建新的 Issue 寻求帮助
4. 在 PR 中 @相关的维护者

## 行为准则

请注意，参与此项目即表示您同意遵守我们的行为准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性的批评
- 专注于对社区最有利的事情
- 对其他社区成员表示同理心

---

再次感谢您的贡献！🎉