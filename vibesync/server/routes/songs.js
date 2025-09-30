const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const Song = require('../models/Song');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Multer in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Simple auth middleware using JWT in Authorization: Bearer <token>
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Cloudinary config from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/songs/upload
router.post('/upload', authenticate, upload.single('song'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload buffer to Cloudinary as a raw file (audio). Use resource_type: 'auto' to detect.
    const uploadResult = await cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'vibesync/songs' },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }

        try {
          const { originalname } = req.file;
          const title = req.body.title || originalname;
          const artist = req.body.artist || '';

          const song = await Song.create({
            title,
            artist,
            songUrl: result.secure_url,
            public_id: result.public_id,
            uploadedBy: req.user.id,
          });

          return res.status(201).json({ song });
        } catch (dbError) {
          console.error('DB create error:', dbError);
          return res.status(500).json({ error: 'Failed to save song' });
        }
      }
    );

    // Write file buffer to the upload stream
    uploadResult.end(req.file.buffer);
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// GET /api/songs/mysongs
router.get('/mysongs', authenticate, async (req, res) => {
  try {
    const songs = await Song.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ songs });
  } catch (err) {
    console.error('Fetch my songs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


