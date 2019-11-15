const config = require('config');

module.exports = function() {
  if (!config.get('jwtPrivateKey') || !config.get('DbString')  ) {
    throw new Error('FATAL ERROR: one of the environment variable  is not defined.');
  }
}