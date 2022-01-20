const express = require('express')
const request = require('request')
const { VoiceMessage } = require('../db')
const wxapi = require('../work/wxapi')
const router = express.Router()

router.get('/', async function (req, res, next) {
  res.render('index', {})
})

// get voice list
router.get("/voice", async (req, res) => {
  try {
    const result = await VoiceMessage.findAll({
      order: [['date', 'DESC']],
      limit: 50
    })
    res.send({
      code: 0,
      data: result,
    });
  } catch (e) {
    console.log('get voice error', e)
    res.sendStatus(500)
  }
});

router.post('/wx/call', async function (req, res, next) {
  const { headers, body } = req;

  if (!headers['x-wx-source']) {
    return res.send('fail');
  }

  console.log('wx call', body)

  if (body.MsgType === 'voice') {
    const { video_url, errcode, errmsg } = await wxapi.get('cgi-bin/media/get', `media_id=${body.MediaId}`, true)
    if (!video_url) {
      console.log('voice media error', errcode, errmsg)
    }
    const { errcode1, errmsg1, url, token, authorization, file_id, cos_file_id, key } = wxapi.post('tcb/uploadfile', {
      "env": process.env.ENVID,
      "path": `voice/${body.MediaId}.amr`
    })
    console.log('ready upload', errcode1, errmsg1, url, token, authorization, file_id, cos_file_id, key)
    if (errcode1 === 0) {

    }
  }

  return res.send('success');
})

module.exports = router
