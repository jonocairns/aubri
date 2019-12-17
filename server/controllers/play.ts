import { data } from '../server';
import { Audiobook } from '../contracts/audiobook';
var fs = require('fs');

export const play = async (req: any, res: any, next: any) => {
    try {
        const id = req.params.id;
        const file = req.params.file;
        const results = await data.read('SELECT * FROM audiobook WHERE id = $1', [id]);
    
        
        const folder = (results.rows[0] as Audiobook).folder;
        const book = `${folder}/${file}`;
    
        console.log(`playing ${book}`)
        var stat = fs.statSync(book);
        const range = req.headers.range;
        var readStream: any;
    
        if (range !== undefined) {
            var parts = range.replace(/bytes=/, "").split("-");
    
            var partial_start = parts[0];
            var partial_end = parts[1];
    
            if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
                console.log('ERR_INCOMPLETE_CHUNKED_ENCODING');
                return res.sendStatus(500).end(); //ERR_INCOMPLETE_CHUNKED_ENCODING
            }
    
            var start = parseInt(partial_start, 10);
            var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
            var content_length = (end - start) + 1;
    
            res.status(206).header({
                'Content-Type': 'audio/mpeg',
                'Content-Length': content_length,
                'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
            });
    
            readStream = fs.createReadStream(book, {start: start, end: end});
        } else {
            res.header({
                'Content-Type': 'audio/mpeg',
                'Content-Length': stat.size
            });
            readStream = fs.createReadStream(book);
        }
        readStream.pipe(res);

        req.on('close', () => {
            console.log('request closed... killing stream')
            readStream.destroy();
        });

        readStream.on('error', (e: any) => {
            res.sendStatus(404);
        });
    } catch(err) {
        console.log(err);
    }
}