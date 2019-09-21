const winston = require('winston');
const config = require('config');
require('winston-mongodb');
require('express-async-errors');

module.exports = function() {
  winston.handleExceptions(
    new winston.transports.File({ filename: './LogFiles/uncaughtExceptions.log' }));
  
  process.on('unhandledRejection', (ex) => {
    throw ex;
  });
  
  winston.add(winston.transports.File, { filename: './LogFiles/logfile.log' });
  winston.add(winston.transports.MongoDB, { 
    db: config.get('DbString'),
    level: 'info'
  });  
}