const createError = require('http-errors')
const express = require('express')
const path = require('path')
const morgan = require("morgan");

const indexRouter = require('./routes/index')
const logger = morgan("tiny");

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger);
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.send(404)
})

module.exports = app
