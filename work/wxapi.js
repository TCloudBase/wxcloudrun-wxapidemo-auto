const fs = require('fs')
const request = require('request')
const demo = null

function getToken () {
  const res = {}
  if (demo != null) {
    res.token = demo
  } else {
    try {
      res.token = fs.readFileSync('/.tencentcloudbase/wx/cloudbase_access_token', 'utf-8')
      res.ca = fs.readFileSync('/app/cert/certificate.crt', 'utf-8')
    } catch (e) {
      console.log(e.toString())
    }
  }
  return res
}

async function call (name, data) {
  const token = getToken()
  if (token.token != null) {
    var options = {
      method: 'POST',
      url: `https://api.weixin.qq.com/${name}${token.ca == null ? '?cloudbase_access_token=' + token.token : ''}`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      ca: token.ca
    }
    return new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) {
          reject(error)
        }
        console.log(`${token.ca == null ? 'token调用' : '开放服务调用'}：`, typeof response === 'object' ? response.body : response)
        resolve(typeof response === 'object' ? JSON.parse(response.body || '{}') : {})
      })
    })
  } else {
    return {
      errcode: -110,
      errmsg: 'access_token is not exist!'
    }
  }
}

module.exports = {
  getToken,
  call
}
