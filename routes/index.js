const express = require('express')
const request = require('request')
const { VoiceMessage } = require('../db')
const { COS, Bucket, Region } = require('../work/cos')
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
    const { data: stream, size, errcode, errmsg } = await wxapi.get('cgi-bin/media/get', `media_id=${body.MediaId}`, true)
    if (errcode > 0) {
      console.log('voice media error', errcode, errmsg)
    }

    const Key = `weekup/voice/${body.MediaId}.amr`
    COS.putObject({
      Bucket,
      Region,
      Key,
      Body: stream,
      // ContentLength: size,
      ContentType: 'audio/amr'
    }, async function (err, data) {
      if (err) {
        console.log('upload error', err)
      }
      console.log('upload success', Key);

      await VoiceMessage.create({
        openid: body.FromUserName,
        name: '小姜',
        avatar_url: '',
        msg_url: data.Location,
        date: body.CreateTime * 1000
      })
      console.log('added', data.Location);
    });
  }

  return res.send('success');
})

module.exports = router
