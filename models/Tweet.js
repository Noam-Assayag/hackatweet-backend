const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  hashtags: [String],
  likes: [String],
  createdAt: { type: Date, default: Date.now },
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;