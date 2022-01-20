const express = require('express')
const request = require('request')
const { VoiceMessage } = require('../db')
const wxapi = require('../work/wxapi')
const router = express.Router()

router.get('/', async function (req, res, next) {
  res.render('index', {})
})

// get voice list
app.get("/voice", async (req, res) => {
  const result = await VoiceMessage.findAll({
    order: ['date', 'DESC'],
    limit: 50
  })
  res.send({
    code: 0,
    data: result,
  });
});

router.post('/wx/call', async function (req, res, next) {
  const { headers, body } = req;

  if (!headers['x-wx-source']) {
    return res.send('fail');
  }

  console.log('wx call', body)

  if (body.MsgType === 'voice') {
    // const userInfo = await wxapi.get('sns/userinfo', `openid=${body.FromUserName}`)
    // console.log('from user', userInfo)

    // let result = {
    //   errcode: 0,
    //   errmsg: 'ok'
    // }
    // if (!body.Recognition) {
    //   result = await wxapi.post('wxa/msg_sec_check', {
    //     openid: req.headers['x-wx-openid'],
    //     version: 2,
    //     scene: 2,
    //     content: body.Recognition
    //   }, true)
    // }

    // if (result.errcode !== 0) {
    //   console.log('voice verify notice', body.Recognition, result)
    // } else {
    const { video_url, errcode, errmsg } = await wxapi.get('cgi-bin/media/get', `media_id=${body.MediaId}`, true)
    if (!video_url) {
      console.log('voice media error', errcode, errmsg)
    }
    // }

    // request.get(video_url, {}, async (error, response) => {
    //   if (error) {
    //     console.log('download media error', error);
    //   } else {
    const { errcode1, errmsg1, url, token, authorization, file_id, cos_file_id, key } = wxapi.post('/tcb/uploadfile', {
      "env": process.env.ENVID,
      "path": `voice/${body.MediaId}.amr`
    })
    console.log('ready upload', errcode1, errmsg1, url, token, authorization, file_id, cos_file_id, key)
  }
  // })

  // }

  return res.send('success');
})

module.exports = router
