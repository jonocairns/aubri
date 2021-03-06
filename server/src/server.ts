import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';

import {checkJwt} from './auth';
import {item, list} from './controllers/audio';
import {download, play, save} from './controllers/play';
import {settings} from './controllers/settings';
import {init} from './core/file';
import {watcher} from './core/watcher';

dotenv.config();

(async function main() {
  try {
    await init();
    watcher();
  } catch (err) {
    console.log(err);
  }
})();

const app = express();

app.on('error', console.log);

app.use(cors());

app.listen(6969, () => {
  console.log('[NodeJS] Application Listening on Port 6969');
});

const staticFiles = path.join(__dirname, '../../../client/build');

if (fs.existsSync(staticFiles)) {
  console.log(`found static files @ ${staticFiles}`);
  app.use('/', express.static(staticFiles));
} else {
  console.log('could not find static files.');
}

// no auth here but uses the fileID (sha512 hash + salt) that is ONLY provided to the client on authenticated routes.
app.get('/api/audio/play/:id', play);
app.get('/api/audio/download/:id', download);

app.get('/api/audio/save/:id/:time', checkJwt, save);
app.get('/api/audio/grid/:count/:query?', checkJwt, list);
app.get('/api/audio/:id', checkJwt, item);
app.get('/api/settings', settings);

app.get('*', (req, res) => {
  res.sendFile(`${staticFiles}/index.html`);
});

app.use((err: Error, req: any, res: any, next: any) => {
  console.log(err.name);
  console.log(err.message);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized');
  } else {
    res.status(500).send('Something broke!');
  }
});
