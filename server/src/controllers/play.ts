import crypto from 'crypto';
import {Request, Response} from 'express';
import fs from 'fs';

import {query, trans} from '../core/data';
import {Audiobook} from '../core/schema';

interface ParamsDictionary {
  [id: string]: string;
}

export const play = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const id = req.params.id;
    const file = req.params.file;
    const results = await query('SELECT * FROM audiobook WHERE id = $1', [id]);

    const folder = (results.rows[0] as Audiobook).folder;
    const book = `${folder}/${file}`;

    console.log(`playing ${book}`);
    const stat = fs.statSync(book);
    const range = req.headers.range;
    let readStream: fs.ReadStream;

    if (range !== undefined) {
      const parts = range.replace(/bytes=/, '').split('-');

      const partialStart = parts[0];
      const partialEnd = parts[1];

      if (
        (isNaN(Number(partialStart)) && partialStart.length > 1) ||
        (isNaN(Number(partialEnd)) && partialEnd.length > 1)
      ) {
        console.log('ERR_INCOMPLETE_CHUNKED_ENCODING');
        return res.sendStatus(500).end(); //ERR_INCOMPLETE_CHUNKED_ENCODING
      }

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1;
      const contentLength = end - start + 1;

      res.status(206).header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': contentLength,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
      });

      readStream = fs.createReadStream(book, {start: start, end: end});
    } else {
      res.header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size,
      });
      readStream = fs.createReadStream(book);
    }
    readStream.pipe(res);

    req.on('close', () => {
      console.log('request closed... killing stream');
      readStream.destroy();
    });

    readStream.on('error', (e: Error) => {
      res.sendStatus(404);
    });
  } catch (err) {
    console.log(err);
  }
};

export const save = async (req: Request<ParamsDictionary>, res: Response) => {
  const id = req.params.id;
  const file = req.params.file;
  const bytes = req.params.bytes;

  // should do this by user as well...
  const hash = crypto
    .createHash('md5')
    .update(`${id}${file}`)
    .digest('hex');

  const items = await query('SELECT * FROM session WHERE id = $1', [hash]);

  if (items.rows.length === 0) {
    await trans(c =>
      c.query('INSERT INTO session(id,time) VALUES($1,$2)', [hash, bytes])
    );
  } else {
    await trans(c =>
      c.query('UPDATE session SET time = $2 WHERE id = $1', [hash, bytes])
    );
  }
  console.log(`saved ${id} ${file}`);
  res.sendStatus(200);
};

export const get = async (req: Request<ParamsDictionary>, res: Response) => {
  const id = req.params.id;
  const file = req.params.file;

  const hash = crypto
    .createHash('md5')
    .update(`${id}${file}`)
    .digest('hex');

  const result = await query('SELECT * FROM session WHERE id = $1', [hash]);
  if (!result || !result.rows || result.rows.length === 0) {
    res.sendStatus(404);
  } else {
    res.json(result.rows[0]);
  }
};
