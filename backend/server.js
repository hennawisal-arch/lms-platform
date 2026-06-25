// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const path = require('path');
// const { Server } = require('socket.io');

// const connectDB = require('./config/db');
// const { notFound, errorHandler } = require('./middleware/errorHandler');
// const registerWebrtcSignaling = require('./socket/webrtcSignaling');

// const authRoutes = require('./routes/authRoutes');
// const courseRoutes = require('./routes/courseRoutes');
// const quizRoutes = require('./routes/quizRoutes');
// const progressRoutes = require('./routes/progressRoutes');
// const certificateRoutes = require('./routes/certificateRoutes');
// const videoRoutes = require('./routes/videoRoutes');
// const contactRoutes = require('./routes/contactRoutes');
// const instructorRoutes = require('./routes/instructorRoutes');

// connectDB();

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
// });

// app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static file serving for thumbnails (videos are served via the streaming endpoint, not statically)
// app.use('/uploads/thumbnails', express.static(path.join(__dirname, 'uploads', 'thumbnails')));

// app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/progress', progressRoutes);
// app.use('/api/certificates', certificateRoutes);
// app.use('/api/videos', videoRoutes);
// app.use('/api/contact', contactRoutes);
// app.use('/api/instructors', instructorRoutes);

// app.use(notFound);
// app.use(errorHandler);

// registerWebrtcSignaling(io);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`LMS API + signaling server running on port ${PORT}`));

// module.exports = { app, server, io };






require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const registerWebrtcSignaling = require('./socket/webrtcSignaling');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const videoRoutes = require('./routes/videoRoutes');
const contactRoutes = require('./routes/contactRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

// Vercel gives every branch/deployment its own subdomain (production URL,
// git-branch URL, per-commit preview URLs, etc.) — a single hardcoded
// CLIENT_URL can't cover all of them. This allows:
//   1. Any origin explicitly listed in CLIENT_URL (comma-separated), for
//      custom domains or other hosts.
//   2. Any *.vercel.app origin automatically, covering all Vercel-generated URLs.
const explicitOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser requests (curl, server-to-server) send no Origin header
  if (explicitOrigins.length === 0) return true; // nothing configured — don't block (e.g. local dev)
  if (explicitOrigins.includes(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  return false;
};

const corsOriginHandler = (origin, callback) => {
  if (isAllowedOrigin(origin)) callback(null, true);
  else callback(new Error(`CORS blocked for origin: ${origin}`));
};

const io = new Server(server, {
  cors: { origin: corsOriginHandler, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: corsOriginHandler }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for thumbnails (videos are served via the streaming endpoint, not statically)
app.use('/uploads/thumbnails', express.static(path.join(__dirname, 'uploads', 'thumbnails')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/instructors', instructorRoutes);

app.use(notFound);
app.use(errorHandler);

registerWebrtcSignaling(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`LMS API + signaling server running on port ${PORT}`));

module.exports = { app, server, io };