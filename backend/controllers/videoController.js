const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');

const videoDir = path.join(__dirname, '..', 'uploads', 'videos');

// @route GET /api/videos/stream/:filename
// Supports HTTP range requests so the <video> element can seek/scrub.
const streamVideo = asyncHandler(async (req, res) => {
  const filePath = path.join(videoDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('Video file not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'video/mp4',
  });

  fs.createReadStream(filePath, { start, end }).pipe(res);
});

module.exports = { streamVideo };
