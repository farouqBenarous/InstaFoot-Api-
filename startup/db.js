const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');
module.exports = async function () {
  try {
    const result = await mongoose.connect(config.get('DbString'), {useNewUrlParser: true})
    winston.info('Connected to MongoDB...')
  }
  catch (e) {
console.log('something in database faild') }
}

