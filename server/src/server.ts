import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';

import {checkJwt} from './auth';
import {item, list} from './controllers/audio';
import {play, save} from './controllers/play';
import {settings} from './controllers/settings';
import {init} from './core/file';

dotenv.config();

(async function main() {
  try {
    await init();
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

const staticFiles = path.join(__dirname, '../../client/build');

if (fs.existsSync(staticFiles)) {
  console.log(`found static files @ ${staticFiles}`);
  app.use('/', express.static(staticFiles));
}

// no auth here but uses the fileID (sha512 hash + salt) that is ONLY provided to the client on authenticated routes.
app.get('/api/audio/play/:id', play);

app.get('/api/audio/save/:id/:time', checkJwt, save);
app.get('/api/audio', checkJwt, list);
app.get('/api/audio/:id', checkJwt, item);
app.get('/api/settings', settings);

app.get('*', (req, res) => {
  res.sendFile(`${staticFiles}/index.html`);
});
