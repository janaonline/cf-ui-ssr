const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const browserDir = path.join(__dirname, 'dist/cf-ui-ssr/browser');

try {
  const files = fs.readdirSync(browserDir);
  // JS filenames contain content hashes (outputHashing: "all"), so hashing
  // their names produces a unique fingerprint for each build.
  const jsFiles = files.filter((f) => f.endsWith('.js')).sort();
  if (!jsFiles.length) {
    throw new Error('No JS files found in browser dist — did the build complete?');
  }
  const buildHash = crypto.createHash('md5').update(jsFiles.join(',')).digest('hex');
  fs.writeFileSync(
    path.join(browserDir, 'version.json'),
    JSON.stringify({ hash: buildHash }),
  );
  console.log(`post-build: version.json written (hash: ${buildHash})`);
} catch (err) {
  console.error('post-build: failed to write version.json:', err.message);
  process.exit(1);
}
