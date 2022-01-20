const fs = require('fs')
const request = require('request')
const demo = null // 本地自验证时，指定token，不会读取容器挂载的token

function getToken() {
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

async function post(name, data) {
  return call(name, 'POST', data)
}


async function get(name, data) {
  return call(name, 'GET', data)
}

/**
 *
 * @param {string} name API名称，路径内填写，只支持POST
 * @param {object} data API要求的数据data
 * @param {boolean} ssl 是否https调用，默认是，如果是本地调试形态，会自动用否，不建议自主传入
 * @returns {object} 返回内容，api返回直接透传，网络问题则统一包装成与api回包一致
 */
async function call(name, method, data, ssl = true) {
  console.log(`\n--------- 请求发起【${name}】 ---------`)
  const token = getToken()
  if (token.token != null) { // 如果token存在，开始发起请求
    // 包装api请求
    // ca文件不存在并且ssl为true时，则附加token，否则则不附加token
    // ssl为false，说明尝试https遇到ssl问题，则证明是本地调试环境，并且开启了开放服务，所以http时无需传入token
    var options = {
      method: method,
      url: `https://api.weixin.qq.com/${name}?cloudbase_access_token=${token.token}&${method === 'GET' && data ? data : ''}`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: method === 'POST' && data ? JSON.stringify(data) : null,
      // ca: token.ca,
      // secureProtocol: 'TLSv1_2_method'
    }
    // console.log(`${ssl === true ? '发起https请求' : '发起http请求'}，${ssl === true ? '带token' : '免token'}`)
    return new Promise((resolve, reject) => {
      request(options, async function (error, response) {
        if (error) { // 请求有错误
          const err = error.toString()
          if (err.indexOf('SSL') !== -1) { // 筛选错误，如果存在SSL则判定是本地调试环境，且开启开放服务，不支持SSL
            console.log('本地调试模式，不支持HTTPS，尝试HTTP使用')
            resolve(await call(name, data, false)) // 转换 http 运行
          } else { // 其他网络问题
            console.log('网络请求错误', err)
            resolve({ // 返回网络问题
              errcode: -1,
              errmsg: err
            })
          }
        } else {
          const seqid = response.headers['x-openapi-seqid']
          console.log(`${seqid != null ? '开放服务调用｜' + seqid : 'AccessToken调用'}`)
          // console.log('返回结果：', response.body)
          try {
            if (response.headers['content-type'] === 'application/json') {
              resolve(JSON.parse(response.body))
            } else {
              resolve(response.body)
            }
          } catch (e) {
            console.log('网络请求错误', e.toString(), response.headers)
            resolve({ // 返回网络问题
              errcode: -1,
              errmsg: e.toString(),
            })
          }
        }
      })
    })
  } else {
    return {
      errcode: -110,
      errmsg: 'access_token is not exist!'
    }
  }
}

function download(name, data) {
  console.log(`\n--------- downloading ${name} ---------`)
  const token = getToken()
  if (token.token != null) {
    var options = {
      method: 'GET',
      url: `https://api.weixin.qq.com/${name}?cloudbase_access_token=${token.token}&${data}`,
    }
    return new Promise((resolve, reject) => {
      let httpStream = request(options)
      let writeStream = fs.createWriteStream(data);
      httpStream.pipe(writeStream)
      httpStream.on('response', (response) => {
        console.log('response headers is: ', response.headers);
      });
      let totalLength = 0;
      httpStream.on('data', (chunk) => {
        totalLength += chunk.length;
        console.log('recevied data size: ' + totalLength + 'bytes');
      });
      writeStream.on('close', () => {
        console.log('--------- download finished ---------');
        resolve(data)
      });
    })
  } else {
    return Promise.reject({
      errcode: -110,
      errmsg: 'access_token is not exist!'
    })
  }
}

module.exports = {
  getToken,
  call,
  post,
  get,
  download
}
