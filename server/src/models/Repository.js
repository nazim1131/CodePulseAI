const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubRepoId: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  repoUrl: { type: String },
  language: { type: String },
  branch: { type: String, default: 'main' },
  lastScan: { type: Date },
  score: { type: Number, default: 0 }
}, { timestamps: true });

repositorySchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);
