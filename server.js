const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const { errorHandler } = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3000

app.use(logger) // custom logger middleware

app.use(cors(corsOptions)) // enable Cross Origin Resource Sharing

app.use(express.json()) // parse application/json

app.use(cookieParser()) // parse cookies

app.use('/', express.static(path.join(__dirname, '/public'))) // serve static files

app.use('/', require('./routes/root')) // serve root routes

app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '/views/404.html'))
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not found' })
  } else {
    res.type('txt').send('404 Not found')
  }
})

app.use(errorHandler) // custom error handler middleware

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})