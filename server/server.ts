import express from 'express';
import cors from 'cors';
import { play, save, get } from './controllers/play';
import { list, item } from './controllers/audio';
import { init } from './core/file';
import dotenv from 'dotenv';

dotenv.config();

(async function main() {
    try {
        await init();
    } catch (err) {
        console.log(err);
    }
})();

export const mem = {
} as any;

var app = express();

app.on('error', console.log);

app.use(cors());

app.listen(6969, () => {
    console.log("[NodeJS] Application Listening on Port 6969");
});

app.get('/api/audio/play/:id/:file', play);

app.get('/api/audio/save/:id/:file/:bytes', save);
app.get('/api/audio/play/:id/:file/time', get);


app.get('/api/audio', list);
app.get('/api/audio/:id', item);