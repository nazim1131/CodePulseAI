const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', required: true },
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  score: { type: Number, required: true },
  totalBugs: { type: Number, default: 0 },
  performanceIssues: { type: Number, default: 0 },
  improvements: { type: Number, default: 0 },
  issues: [{
    file: String,
    line: Number,
    type: { type: String, enum: ['bug', 'performance', 'improvement'] },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    confidenceScore: Number,
    message: String,
    suggestion: String,
    explanation: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
