const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    port: 8080,
    proxy: {
      '/': {
        target: 'http://localhost:2233/',
        ws: false
        // 将请求前缀key（key为正则表达式）重写为value。用来将请求前缀统一替换
        // pathRewrite: { 'key': 'value' }
      }
    }
  }
})
