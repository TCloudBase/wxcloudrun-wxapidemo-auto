const express = require('express')
const wxapi = require('../work/wxapi')
const router = express.Router()

router.get('/', async function (req, res, next) {
  res.render('index', {})
})

router.post('/wx/call', async function (req, res, next) {
  const { headers, body } = req;

  if (!headers['x-wx-source']) {
    res.send('fail');
    return;
  }

  console.log('wx call', body)

  if (body.MsgType === 'voice') {
    const userInfo = await wxapi.get('sns/userinfo', `openid=${body.FromUserName}`)
    console.log('from user', userInfo)

    let result = {
      errcode: 0,
      errmsg: 'ok'
    }
    if (!body.Recognition) {
      result = await wxapi.call('wxa/msg_sec_check', {
        content: body.Recognition
      })
    }

    if (result.errcode !== 0) {
      console.log('voice verify notice', body.Recognition)
    } else {
      console.log('voice upload.')
    }

    res.json(result)
  }

  res.send('success');
})

module.exports = router
