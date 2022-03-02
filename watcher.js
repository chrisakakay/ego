module.exports.start = ({ onChange }) => {
  const chokidar = require('chokidar');

  chokidar.watch('./src', { ignoreInitial: true }).on('all', (e, path) => {
    //console.log(e, path);

    onChange(); // generateBuild();
  });
}
