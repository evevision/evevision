import path from 'path';
import rimraf from 'rimraf';

export default function deleteSourceMaps() {
  rimraf.sync(path.join(__dirname, '../output/main/*.js.map'));
  rimraf.sync(path.join(__dirname, '../output/renderer/*.js.map'));
}
