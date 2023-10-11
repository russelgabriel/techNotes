const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc    Get all users
// @route   GET /users
// @access  Public
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean() // exclude password field and give data like JSON without extras
  if (!users?.length) {
    return res.status(404).json({ message: 'No users found'})
  }
  return res.json(users)
})

// @desc    Create new user
// @route   POST /users
// @access  Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body

  // Confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'All fields are required' })
  } 

  // Check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec() 

  if (duplicate) {
    return res.status(409).json({ message: 'Username already exists' })
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10) // 10 is the salt rounds

  const userObject = { username, "password": hashedPwd, roles }

  // Create and store new user
  const user = await User.create(userObject)

  if (user) {
    res.status(201).json({ message: `User ${username} created successfully`})
  } else {
    res.status(400).json({ message: 'Invalid user data recieved' })
  }
})

// @desc    Update a user
// @route   PATCH /users
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { _id, username, roles, active, password } = req.body

  // Confirm data
  if (!_id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const user = await User.findById(_id).exec() // find user by id and recieve promise with mongoose document
  
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  // Check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec()
  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== _id) {
    return res.status(409).json({ message: 'Duplicate username' })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10) // 10 is the salt rounds
  }

  const updatedUser = await user.save()

  res.json({ message: `User ${updatedUser.username} updated successfully`})
})

// @desc    Delete a user
// @route   DELETE /users
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.body

  if (!_id) {
    return res.status(400).json({ message: 'User id required' })
  }

  const note = await Note.findOne({ user: _id }).lean().exec()
  if (note) {
    return res.status(400).json({ message: 'User has assigned notes' })
  }

  const user = await User.findById(_id).exec()

  if (!user) {
    return res.status(400).json({ message: 'User not found' })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted successfully`

  res.json(reply)
})

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }