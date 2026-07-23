const { readdirSync, statSync } = require('fs');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');

const packageRoot = resolve(__dirname, '..');
const targets = [
  join(packageRoot, 'src'),
  join(packageRoot, 'scripts'),
  join(packageRoot, 'test'),
];

function collectJavaScriptFiles(target) {
  if (!statSync(target).isDirectory()) return target.endsWith('.js') ? [target] : [];
  return readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const child = join(target, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(child);
    return entry.name.endsWith('.js') ? [child] : [];
  });
}

const files = targets.flatMap(collectJavaScriptFiles);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`Syntax checked ${files.length} JavaScript files`);
