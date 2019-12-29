import chokidar from 'chokidar';

import {CONSTANTS} from '../constants';

export const watcher = () => {
  const watcher = chokidar.watch(CONSTANTS.folderPath, {
    ignored: /^\./,
    persistent: true,
  });

  let hasStarted = false;

  watcher
    .on('add', path => {
      if (hasStarted) {
        console.log('File', path, 'has been added');
      }
    })
    .on('change', path => {
      console.log('File', path, 'has been changed');
    })
    .on('unlink', path => {
      console.log('File', path, 'has been removed');
    })
    .on('addDir', path => {
      if (hasStarted) {
        console.log(`Directory ${path} has been added`);
      }
    })
    .on('unlinkDir', path => console.log(`Directory ${path} has been removed`))
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => {
      hasStarted = true;
      console.log('Initial scan complete. Ready for changes');
    });
};
