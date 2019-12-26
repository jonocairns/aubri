import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';

import {item, list} from './controllers/audio';
import {play, save} from './controllers/play';
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

app.get('/api/audio/play/:id', play);

app.get('/api/audio/save/:id/:userId/:time', save);

app.get('/api/audio', list);
app.get('/api/audio/:id/:userId', item);
