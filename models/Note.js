const mongoose = require('mongoose')
const { autoIncrement } = require('mongoose-plugin-autoinc')

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }, 
    title: {
      type: String,
      required: true
    }, 
    text: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt fields
  }
)

noteSchema.plugin(autoIncrement, {
  model: 'Note',
  field: 'ticketNum',
  startAt: 500,
  incrementBy: 1
})

module.exports = mongoose.model('Note', noteSchema)