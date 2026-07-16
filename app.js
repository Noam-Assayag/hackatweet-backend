require('dotenv').config();

const express = require('express');
const cors = require('cors');

require('./models/connection');

const app = express();
app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');
const tweetsRouter = require('./routes/tweets');

app.use('/users', usersRouter);
app.use('/tweets', tweetsRouter);

module.exports = app;