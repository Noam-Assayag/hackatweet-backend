const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));