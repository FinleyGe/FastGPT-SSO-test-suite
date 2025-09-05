# FastGPT SSO Test Suite

Template: https://github.com/labring/fastgpt-sso-template

FastGPT SSO/用户同步 测试套件。
更方便的生成测试数据，测试用户同步、组织架构同步。

## 开发方案

1. 安装 bun
2. 安装依赖 `bun install`
3. 启动 `bun run dev`
4. 打包：`docker buildx build --platform=linux/amd64  -f ./projects/sso/Dockerfile -t registry.cn-hangzhou.aliyuncs.com/fastgpt/fastgpt-sso:v4.8.14 .`

## 部署方式
默认端口：3000
```
PORT=your_port bun run dev
```
