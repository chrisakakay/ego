module.exports.start = (config) => {
  require('child_process').exec(`start http://localhost:${config.dev.port || 8080}${config.publicUrl}`);
}
