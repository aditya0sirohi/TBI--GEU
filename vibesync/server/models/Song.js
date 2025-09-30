const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: { type: String },
    artist: { type: String },
    songUrl: { type: String, required: true },
    public_id: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);


