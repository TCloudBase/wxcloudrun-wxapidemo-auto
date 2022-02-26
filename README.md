# 微信云托管｜云调用使用(含本地调试)

[<img src="https://main.qcloudimg.com/raw/ffa781b63fdead4cac23470ad2eeb552.png" width="220px">](https://cloud.weixin.qq.com/cloudrun/onekey?template=wxapidemo)

## 项目介绍

此项目基于微信云托管能力范围编写，应用形态为文字违规检查工具，使用微信云托管免鉴权调用微信服务端接口，全程不感知token。

项目技术栈：后端服务（nodejs + express）、WEB网页（原生js）

如果你已经体验过微信云托管基础能力，可以继续深入体验微信云托管在腾讯云其他产品的关联使用，日志监控等能力。

## 部署流程

- 一键部署方式：点击[此链接](https://cloud.weixin.qq.com/cloudrun/onekey?template=wxapidemo)跳转至控制台安装

- 一键部署结束后，需要前往「控制台-云调用」中配置令牌权限，添加一行 `/wxa/msg_sec_check`

- 手动部署方式：下载此仓库代码，直接在控制台通过代码库创建版本即可完成

- 如果你想对此项目进行本地二次开发，可以将 `/work/wxapi.js` 中 `第3行 demo` 设置token，即可略过读取过程，token的获取在开启云托管服务后，前往实例列表打开`webshell`，输入如下命令即可获取(注意不包含最后的#号)：
  ``` bash
  cat /.tencentcloudbase/wx/cloudbase_access_token
  ```

## 项目总结

1. 如果你的技术栈也是 nodejs + express ，可以直接复用 `/work/wxapi.js` 文件，使用方法如下：
  ``` js
  const wxapi = require('/work/wxapi') //引入文件
  // wxa/msg_sec_check 替换自己想要触发的微信服务API，后面的对象为API需要的数据
  result = await wxapi.call('wxa/msg_sec_check', {
    content: text
  })
  ```

2. 使用微信API，一定记得前往「控制台-云调用」中配置令牌权限，你也可以直接使用微信云托管提供的开放接口服务，以旁加载形式部署到服务中，占用计算资源和内存极小（约 5MB），与服务共用资源。如果开启，则上述代码将会自动转变为开放服务模式，两种情况均兼容。

## 项目作者

- 李冠宇zira（腾讯技术产品经理，架构师，专家讲师）
- 如果想了解更多，欢迎关注公众号「腾讯云云开发」，回复“加群”或“云托管”，加入各种官方交流群!
    
