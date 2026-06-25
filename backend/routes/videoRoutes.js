const express = require('express');
const router = express.Router();
const { streamVideo } = require('../controllers/videoController');
const { protectFlexible } = require('../middleware/auth');

router.get('/stream/:filename', protectFlexible, streamVideo);

module.exports = router;
