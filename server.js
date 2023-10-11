require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const { errorHandler } = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger) // custom logger middleware

app.use(cors(corsOptions)) // enable Cross Origin Resource Sharing

app.use(express.json()) // parse application/json

app.use(cookieParser()) // parse cookies

app.use('/', express.static(path.join(__dirname, '/public'))) // serve static files

app.use('/', require('./routes/root')) // serve root routes
app.use('/users', require('./routes/userRoutes')) // serve user routes
app.use('/notes', require('./routes/noteRoutes')) // serve note routes

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

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => {console.log(`Server is running on port ${PORT}.`)})
})

mongoose.connection.on('error', err => {
  console.log(err)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})