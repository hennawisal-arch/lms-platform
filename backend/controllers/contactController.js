const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage');

// @route POST /api/contact  (public)
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }
  const saved = await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ message: 'Your message has been received. We will get back to you soon.', id: saved._id });
});

// @route GET /api/contact  (admin only)
const getMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort('-createdAt');
  res.json({ messages });
});

module.exports = { submitMessage, getMessages };
