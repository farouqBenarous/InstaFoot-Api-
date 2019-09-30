const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');
module.exports = function() {
  mongoose.connect(config.get('DbString') ,  { useNewUrlParser: true } )
        .then(() => winston.info('Connected to MongoDB...'));
}

