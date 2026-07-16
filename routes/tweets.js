const express = require('express');
const router = express.Router();

const Tweet = require('../models/Tweet');
const User = require('../models/User');

// Extraction des hashtags depuis le texte
function extractHashtags(text) {
  const matches = text.match(/#\w+/g);
  return matches ? matches.map(tag => tag.slice(1)) : [];
}

// POST /tweets - créer un tweet
router.post('/', (req, res) => {
  const { token, content } = req.body;

  if (!token || !content) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  if (content.length > 280) {
    res.json({ result: false, error: 'Tweet exceeds 280 characters' });
    return;
  }

  User.findOne({ token }).then(user => {
    if (!user) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    const newTweet = new Tweet({
      content,
      author: user._id,
      hashtags: extractHashtags(content),
      likes: [],
    });

    newTweet.save().then(newDoc => {
      res.json({ result: true, tweet: newDoc });
    });
  });
});

// GET /tweets - récupérer tous les tweets
router.get('/', (req, res) => {
  Tweet.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .then(tweets => {
      res.json({ result: true, tweets });
    });
});

// DELETE /tweets/:id - supprimer un tweet (uniquement le sien)
router.delete('/:id', (req, res) => {
  const { token } = req.body;

  User.findOne({ token }).then(user => {
    if (!user) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    Tweet.findOne({ _id: req.params.id }).then(tweet => {
      if (!tweet) {
        res.json({ result: false, error: 'Tweet not found' });
        return;
      }

      if (tweet.author.toString() !== user._id.toString()) {
        res.json({ result: false, error: 'Not authorized to delete this tweet' });
        return;
      }

      Tweet.deleteOne({ _id: req.params.id }).then(() => {
        res.json({ result: true });
      });
    });
  });
});

// POST /tweets/:id/like - liker/unliker un tweet
router.post('/:id/like', (req, res) => {
  const { token } = req.body;

  User.findOne({ token }).then(user => {
    if (!user) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    Tweet.findOne({ _id: req.params.id }).then(tweet => {
      if (!tweet) {
        res.json({ result: false, error: 'Tweet not found' });
        return;
      }

      const alreadyLiked = tweet.likes.includes(user.username);

      const update = alreadyLiked
        ? { $pull: { likes: user.username } }
        : { $push: { likes: user.username } };

      Tweet.updateOne({ _id: req.params.id }, update).then(() => {
        res.json({ result: true, liked: !alreadyLiked });
      });
    });
  });
});

// GET /tweets/hashtag/:name - tweets par hashtag
router.get('/hashtag/:name', (req, res) => {
  Tweet.find({ hashtags: req.params.name })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .then(tweets => {
      res.json({ result: true, tweets });
    });
});

// GET /tweets/trends - tous les hashtags avec leur compteur
router.get('/trends/all', (req, res) => {
  Tweet.find().then(tweets => {
    const counts = {};
    tweets.forEach(tweet => {
      tweet.hashtags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    res.json({ result: true, trends: counts });
  });
});

module.exports = router;