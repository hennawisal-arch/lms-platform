const express = require('express');
const router = express.Router();
const { submitMessage, getMessages } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitMessage);
router.get('/', protect, authorize('admin'), getMessages);

module.exports = router;
