const express = require('express')
const fs = require('fs');
const { VoiceMessage } = require('../db')
const { COS, Bucket, Region } = require('../work/cos')
const wxapi = require('../work/wxapi')
const router = express.Router()

router.get('/', async function (req, res, next) {
  res.render('index', {})
})

router.get('/images', async function (req, res, next) {
  res.send(await wxapi.post('cgi-bin/material/batchget_material', {
    type: 'image',
    offset: req.query['offset'],
    count: req.query['count']
  }))
})

// get voice list
router.get("/voice", async (req, res) => {
  try {
    const result = await VoiceMessage.findAll({
      order: [['createdAt', 'DESC']],
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
    const name = await wxapi.download('cgi-bin/media/get', `media_id=${body.MediaId}`, true)
    const Key = `weekup/voice/${body.MediaId}.amr`
    COS.sliceUploadFile({
      Bucket,
      Region,
      Key,
      FilePath: name,
      ContentType: 'audio/amr',
      asyncLimit: 2
    }, async function (err, data) {
      if (err) {
        console.log('upload error', err)
      }
      console.log('upload success', Key);

      const UNAME = {
        0: '萌姜',
        1: '小姜',
        2: '大姜'
      }
      var rand = Math.floor(Math.random() * Object.keys(UNAME).length);
      var randName = UNAME[Object.keys(UNAME)[rand]];

      await VoiceMessage.create({
        openid: body.FromUserName,
        name: randName,
        avatar_url: '',
        media_id: body.MediaId,
        msg_id: body.MsgId,
        msg_url: data.Location,
        date: new Date(body.CreateTime)
      })
      console.log('added', data.Location);
      fs.unlinkSync(name);
    });

    var xmlContent = `<xml>
  <ToUserName><![CDATA[${body.FromUserName}]]></ToUserName>
  <FromUserName><![CDATA[${body.ToUserName}]]></FromUserName>
  <CreateTime>${Math.round(new Date().getTime() / 1000)}</CreateTime>
  <MsgType><![CDATA[image]]></MsgType>
  <Image>
    <MediaId><![CDATA[${process.env.RET_MEDIA_ID}]]></MediaId>
  </Image>
</xml>`;
    //     var xmlContent = `<xml>
    //   <ToUserName><![CDATA[${body.FromUserName}]]></ToUserName>
    //   <FromUserName><![CDATA[${body.ToUserName}]]></FromUserName>
    //   <CreateTime>${Math.round(new Date().getTime() / 1000)}</CreateTime>
    //   <MsgType><![CDATA[text]]></MsgType>
    //   <Content><![CDATA[终于等到你，还好我没放弃]]></Content>
    // </xml>`;
    console.log('return xml', xmlContent)
    res.type('application/xml')
    res.send(xmlContent)
  } else {
    return res.send('success');
  }
})

module.exports = router
