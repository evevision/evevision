// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

const mainPath = path.join(__dirname, '..', 'app', 'main', 'main.prod.js');
const rendererPath = path.join(
  __dirname,
  '..',
  'output',
  'renderer',
  'dist',
  'renderer.prod.js'
);
const nativePath = path.join(
  __dirname,
  '..',
  'build',
  'Release',
  'native.node'
);

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "yarn build-main"'
    )
  );
}

if (!fs.existsSync(rendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The renderer process is not built yet. Build it by running "yarn build-renderer"'
    )
  );
}

if (!fs.existsSync(nativePath)) {
  throw new Error(
      chalk.whiteBright.bgRed.bold(
          'The native node module is not built yet. Build it by running "yarn build-native"'
      )
  );
}
