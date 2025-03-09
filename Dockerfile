FROM node:22-alpine AS builder

WORKDIR /app

# 安装client依赖
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm install --registry 

# 复制client源码并编译client
COPY client ./client
RUN cd client && npm run build

# 优先复制依赖声明文件 (利用 Docker 缓存层)
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && \
    # 强制检查 lock 文件存在性
    if [ -f package-lock.json ]; then \
      npm ci --production; \
    else \
      echo "Error: package-lock.json not found!" >&2; \
      exit 1; \
    fi


# 生产运行阶段 (最小化镜像)
FROM node:22-alpine

WORKDIR /app

# 从构建阶段复制server已安装的 node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

# 复制server源码和其他必要文件
COPY server ./server

# 复制client构建产物
COPY --from=builder /app/client/dist ./server/static

EXPOSE 2233
CMD [ "node", "server/index.js" ]
