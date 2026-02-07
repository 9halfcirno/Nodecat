<div align="center" style="font-family:monospace">

# NodeCat

兼容**OneBot V11**标准的QQBot框架

</div>

---

## Nodecat是什么？

Nodecat是一个兼容**OneBot V11**标准的QQ机器人框架

## Nodecat可以做什么？

Nodecat是一个第三方QQ机器人框架，可以帮助开发者使用简单的插件代码为Bot添加功能

## 快速开始

> 使用Nodecat前，请确保安装了最新版Node.js，本程序使用到新版本部分内容

### 下载Nodecat

下载本仓库，将Nodecat放在一个你喜欢的地方

### 添加网络配置

编辑`config/onebot.json`，在`onebot_network`数组中，添加
```json
{
	"type": "websocket",
	"role": "server",
	"url": "<OneBot实现的WS服务端URL>",
	"token": "<服务端所需的验证Token>"
}
```

完成后保存文件

### 启动Nodecat
 如果安装有npm包管理器，可使用
```bash
npm run nodecat
```
来启动本程序，若没有npm则通过
```bash
node main.js
```
来启动

### 最后
如果看到
```
Nodecat framework is running now!
```
字样，那么恭喜你已经成功启动Nodecat