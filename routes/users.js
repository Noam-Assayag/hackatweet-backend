const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

const User = require('../models/User');

router.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.firstname || !req.body.password) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data !== null) {
      res.json({ result: false, error: 'User already exists' });
      return;
    }

    const hash = bcrypt.hashSync(req.body.password, 10);
    const token = uid2(32);

    const newUser = new User({
      username: req.body.username,
      firstname: req.body.firstname,
      password: hash,
      token: token,
    });

    newUser.save().then(newDoc => {
      res.json({
        result: true,
        token: newDoc.token,
        username: newDoc.username,
        _id: newDoc._id,
      });
    });
  });
});

router.post('/signin', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data === null || !bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: false, error: 'User not found or wrong password' });
      return;
    }

    res.json({
      result: true,
      token: data.token,
      username: data.username,
      _id: data._id,
    });
  });
});

module.exports = router;