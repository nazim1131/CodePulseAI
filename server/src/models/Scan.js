const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  score: { type: Number },
  issuesFound: { type: Number, default: 0 },
  durationMs: { type: Number },
  error: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
