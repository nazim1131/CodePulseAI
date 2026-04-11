const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  accessToken: { type: String, required: true },
  plan: { type: String, default: 'free', enum: ['free', 'pro', 'team'] },
  scansUsed: { type: Number, default: 0 },
  scanLimit: { type: Number, default: 50 },
  stripeCustomerId: { type: String },
  subscriptionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
