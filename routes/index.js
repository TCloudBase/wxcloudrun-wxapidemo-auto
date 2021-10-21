const express = require('express')
const wxapi = require('../work/wxapi')
const router = express.Router()

router.get('/', async function (req, res, next) {
  res.render('index', {})
})

router.post('/sec', async function (req, res, next) {
  let result = {
    errcode: 0,
    errmsg: 'ok'
  }
  const text = req.body.content || null
  if (text != null) {
    result = await wxapi.call('wxa/msg_sec_check', {
      content: text
    })
  }
  res.json(result)
})

module.exports = router
