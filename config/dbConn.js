const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABSE_URI)
  } catch (err) {
    console.log(err)
  }
}

module.exports = connectDB