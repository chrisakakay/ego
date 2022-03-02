let livereloadServer;

module.exports.start = () => {
  const livereload = require('livereload');

  livereloadServer = livereload.createServer();

  return livereloadServer;
}
