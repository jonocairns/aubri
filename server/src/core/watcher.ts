import chokidar from 'chokidar';

import {CONSTANTS} from '../constants';
import {init} from './file';

export const watcher = () => {
  const watcher = chokidar.watch(CONSTANTS.folderPath, {
    ignored: /^\./,
    persistent: true,
  });

  let hasStarted = false;

  watcher
    .on('add', async path => {
      if (hasStarted) {
        // console.log('File', path, 'has been added');
      }
    })
    .on('change', async path => {
      // console.log('File', path, 'has been changed');
    })
    .on('unlink', path => {
      // console.log('File', path, 'has been removed');
    })
    .on('addDir', async path => {
      if (hasStarted) {
        console.log(`Directory ${path} has been added`);

        await init();
      }
    })
    .on('unlinkDir', async path => {
      await init();
      console.log(`Directory ${path} has been removed`);
    })
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => {
      hasStarted = true;
      console.log('Initial scan complete. Ready for changes');
    });
};
