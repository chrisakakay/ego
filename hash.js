const crypto = require('crypto');
const fs = require('fs');

module.exports.start = async (config) => {
  for (const file of config.hash) {
    const fileBuffer = fs.readFileSync(file.js);
    const hashSum = crypto.createHash('md5');

    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex').slice(-8);

    fs.renameSync(file.js, file.js.replace('.js', `.${hex}.js`));

    let html = await fs.readFileSync(file.html, 'utf8');

    html = html.replace(`src="${file.jsBase}"`, `src="${file.jsBase.replace('.js', `.${hex}.js`)}"`);

    await fs.writeFileSync(file.html, html, { encoding: 'utf8' });
  }
}
