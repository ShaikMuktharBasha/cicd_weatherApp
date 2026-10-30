import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');

// Clean dist directory
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy HTML files
for (const file of fs.readdirSync('.')) {
  if (file.endsWith('.html')) {
    fs.copyFileSync(file, path.join(dist, file));
  }
}

// Copy static assets
copyRecursive('css', path.join(dist, 'css'));
copyRecursive('js', path.join(dist, 'js'));
copyRecursive('img', path.join(dist, 'img'));

console.log('✓ Build completed successfully: Web assets packaged into dist/');
