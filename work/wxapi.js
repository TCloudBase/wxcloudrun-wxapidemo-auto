const fs = require('fs')
const request = require('request')
const demo = null // 本地自验证时，指定token，不会读取容器挂载的token

function getToken () {
  const res = {}
  if (demo != null) {
    res.token = demo
  } else {
    try {
      res.token = fs.readFileSync('/.tencentcloudbase/wx/cloudbase_access_token', 'utf-8')
      res.ca = fs.readFileSync('/app/cert/certificate.crt', 'utf-8')
    } catch (e) {
      if (res.token != null) {
        console.log('未找到开放服务crt证书')
      } else {
        console.log('未找到挂载的token文件')
      }
    }
  }
  return res
}

/**
 *
 * @param {string} name API名称，路径内填写，只支持POST
 * @param {object} data API要求的数据data
 * @param {boolean} ssl 是否https调用，默认是，如果是本地调试形态，会自动用否，不建议自主传入
 * @returns {object} 返回内容，api返回直接透传，网络问题则统一包装成与api回包一致
 */
async function call (name, data) {
  console.log(`\n--------- 请求发起【${name}】 ---------`)
  const token = getToken()
  let ssl = true // 默认为https，指定token或云托管服务内均生效
  if (token.token == null || token.ca != null) { // 本地调试时不存在token，开启接口服务proxy后使用免token模式
    ssl = false
  }
  // 包装api请求
  var options = {
    method: 'POST',
    url: `${ssl === true ? 'https' : 'http'}://api.weixin.qq.com/${name}${ssl === true ? '?cloudbase_access_token=' + token.token : ''}`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
  console.log(ssl === true ? '发起https请求，带token' : '发起http请求，免token')
  return new Promise((resolve, reject) => {
    request(options, async function (error, response) {
      if (error) { // 请求有错误
        const err = error.toString()
        console.log('网络请求错误', err)
        resolve({ // 返回网络问题
          errcode: -1,
          errmsg: err
        })
      } else {
        const seqid = response.headers['x-openapi-seqid']
        console.log(`${seqid != null ? '开放服务调用｜' + seqid : 'AccessToken调用'}`)
        console.log('返回结果：', response.body)
        try {
          resolve(JSON.parse(response.body))
        } catch (e) {
          if (response.body == null || response.body === '') {
            console.log('本地调试时，需开启接口服务proxy后再试！传统服务器请使用原生微信token！教学戳此：https://www.bilibili.com/video/BV1QS4y1S7C7')
            resolve({ // 返回网络问题
              errcode: -1,
              errmsg: '请求错误！本地调试时，需开启接口服务proxy后再试！传统服务器请使用原生微信token！'
            })
          } else if (response.body.indexOf('establish') !== -1) {
            console.log('你的环境服务没有配置出网NAT网关，请前往配置，链接：https://console.cloud.tencent.com/vpc/vpc')
            resolve({ // 返回网络问题
              errcode: -1,
              errmsg: '请求错误！你的环境服务没有配置出网NAT网关！'
            })
          } else {
            console.log('网络请求错误', response.body)
            resolve({ // 返回网络问题
              errcode: -1,
              errmsg: response.body
            })
          }
        }
      }
    })
  })
}

module.exports = {
  getToken,
  call
}
