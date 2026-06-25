const express = require('express');
const router = express.Router();
const { getMyCertificates, downloadCertificate, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyCertificates);
router.get('/:id/download', protect, downloadCertificate);
router.get('/verify/:code', verifyCertificate); // public verification, no auth

module.exports = router;
