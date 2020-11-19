# 运行说明

## 安装依赖

`npm install`

## 开发环境(dev配置文件见根目录下的 `.env`)

`npm run dev`

## 生产环境(prd配置文件见根目录下的 `ecosystem.config.js`)

需先安装pm2

`npm install -g pm2`

然后启动服务

`npm run prd`

## 自动部署

首次部署(拉取代码到指定服务器的制定目录下)

`npm run setup`

部署更新重启

`npm run deploy`
