import {Request, Response} from 'express';
import ffmpeg from 'fluent-ffmpeg';
import {readdir, readFileSync, stat} from 'fs';
import {basename, join} from 'path';
import {promisify} from 'util';

import {query} from '../core/data';
import {Audiobook} from '../core/schema';

const readdirP = promisify(readdir);
const statP = promisify(stat);
const probeP = promisify(ffmpeg.ffprobe);

export const readDirAsync = async (
  dir: string,
  allFiles: Array<string> = []
) => {
  const files = (await readdirP(dir)).map(f => join(dir, f));
  allFiles.push(...files);
  await Promise.all(
    files.map(
      async f => (await statP(f)).isDirectory() && readDirAsync(f, allFiles)
    )
  );
  return allFiles.filter(f => f.indexOf('.mp3') > -1);
};

export const list = async (req: Request, res: Response) => {
  const audiobookResult = await query('SELECT * FROM audiobook', []);

  const books = audiobookResult.rows as Array<Audiobook>;

  const fileResult = await query(
    `SELECT * FROM file WHERE bookId IN (SELECT id FROM audiobook)`,
    []
  );

  const allFiles = fileResult.rows;

  const returnSet = books.map(b => ({
    ...b,
    files: allFiles.filter(af => b.id === af.bookid),
  }));

  res.json(returnSet);
};

interface ParamsDictionary {
  [id: string]: string;
}

export const item = async (req: Request<ParamsDictionary>, res: Response) => {
  const id = req.params.id;
  const d = await query('SELECT * FROM audiobook WHERE id = $1', [id]);
  const row = d.rows[0] as Audiobook;

  const {rows} = await query(`SELECT * FROM file WHERE bookId = $1`, [row.id]);

  const session = await query(
    `SELECT * FROM session WHERE id IN (SELECT id FROM file WHERE bookId = $1)`,
    [row.id]
  );

  res.json({
    ...row,
    files: rows,
    sessions: session.rows,
  });
};
