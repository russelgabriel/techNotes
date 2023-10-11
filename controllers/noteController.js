const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

// @desc    Get all notes
// @route   GET /notes
// @access  Public
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean()
  if (!notes?.length) {
    return res.status(404).json({ message: 'No notes found'})
  }
  
  // Add username to each note
  const notesWithUser = await Promise.all(notes.map(async note => {
    const user = await User.findById(note.user).lean().exec()
    return { ...note, username: user.username }
  }))
  
  res.json(notesWithUser)
})

// @desc    Create new note
// @route   POST /notes
// @access  Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: 'Title already exists' })
  }

  const noteObject = {user, title, text}
  // Create and store new note
  console.log("before create")
  const note = await Note.create(noteObject)
  console.log("after create")

  if (note) {
    return res.status(201).json({ message: `Note ${title} created successfully`})
  }
  return res.status(400).json({ message: 'Invalid note data recieved' })
})

// @desc    Update a note
// @route   PATCH /notes
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec()
  
  if (!note) {
    return res.status(400).json({ message: "Note not found" })
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec()

  // Allow renaming of original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate title' })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed

  const updatedNote = await note.save()

  res.json(`Note ${updatedNote.title} has been updated`)
})

// @desc    Delete a note
// @route   DELETE /notes
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'Note id required' })
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(400).json({ message: "Note not found" })
  }

  const result = await note.deleteOne()

  const reply = `Note ${result.title} with ID ${result._id} has been deleted`

  res.json(reply)
})

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote }