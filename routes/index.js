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
    const userInfo = await wxapi.get('sns/userinfo', `openid=${body.FromUserName}`, false)
    console.log('from user', userInfo)

    let result = {
      errcode: 0,
      errmsg: 'ok'
    }
    if (!body.Recognition) {
      result = await wxapi.get('wxa/msg_sec_check', `content=${body.Recognition}`, false)
    }

    if (result.errcode !== 0) {
      console.log('voice verify notice', body.Recognition, result)
    } else {
      console.log('voice upload.')
      const { video_url, errcode, errmsg } = await wxapi.get('cgi-bin/media/get', `media_id=${body.MediaId}`, false)
      if (!video_url) {
        console.log('voice media error', errcode, errmsg)
      }
    }

    res.json(result)
  }

  res.send('success');
})

module.exports = router
