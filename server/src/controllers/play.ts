import {Request, Response} from 'express';
import fs from 'fs';

import {query, trans} from '../core/data';
import {File} from '../core/schema';
import {strongHash} from './audio';

interface ParamsDictionary {
  [id: string]: string;
}

export const play = async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const id = req.params.id;
    const results = await query('SELECT * FROM file WHERE id = $1', [id]);

    const book = (results.rows[0] as File).location;

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
  const userId = req.params.userId;
  const time = req.params.time;

  const hashedUserId = strongHash(userId);

  const items = await query(
    'SELECT * FROM session WHERE userId = $1 AND fileId = $2',
    [hashedUserId, id]
  );

  if (items.rows.length === 0) {
    await trans(c =>
      c.query('INSERT INTO session(userId,fileId,time) VALUES($1,$2,$3)', [
        hashedUserId,
        id,
        time,
      ])
    );
  } else {
    await trans(c =>
      c.query(
        'UPDATE session SET time = $1 WHERE userId = $2 AND fileId = $3',
        [time, hashedUserId, id]
      )
    );
  }
  console.log(`saved ${id}`);
  res.sendStatus(200);
};
