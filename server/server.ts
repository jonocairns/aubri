import express from 'express';
import cors from 'cors';
import { play } from './controllers/play';
import { list, item } from './controllers/audio';
import Data from './core/data';
import { init } from './core/file';
export const data = new Data();

(async function main() {
    try {
        await init();
    } catch (err) {
        console.log(err);
    }
})();

var app = express();

app.on('error', console.log);

app.use(cors());

app.listen(6969, () => {
    console.log("[NodeJS] Application Listening on Port 6969");
});

app.get('/api/audio/play/:key', play);

app.get('/api/audio', list);
app.get('/api/audio/:id', item);