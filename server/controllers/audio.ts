import { promisify } from 'util';
import { readdir, stat, readFileSync } from 'fs';
import { join, basename } from 'path';
import { query } from '../core/data';
import { Audiobook } from '../core/schema';
const getMP3Duration = require('get-mp3-duration');


const readdirP = promisify(readdir)
const statP = promisify(stat)

const readDirAsync = async (dir: string, allFiles: Array<string> = []) => {
    const files = (await readdirP(dir)).map(f => join(dir, f));
    allFiles.push(...files);
    await Promise.all(
        files.map(
            async f => (await statP(f)).isDirectory() && readDirAsync(f, allFiles)
        )
    );
    return allFiles.filter(f => f.indexOf('.mp3') > -1);
}

export const list = async (req: any, res: any) => {
    const d = await query('SELECT * FROM audiobook', []);
    res.json(d.rows);
};

export const item = async (req: any, res: any) => {
    var id = req.params.id;
    const d = await query('SELECT * FROM audiobook WHERE id = $1', [id]);
    const row = d.rows[0] as Audiobook;
    console.log(`reading ${row.folder}`);
    const files = await readDirAsync(row.folder);

    res.json({
        ...row,
        files: files.map(f => {
            const buffer = readFileSync(f)
            const duration = getMP3Duration(buffer);

            return (
                {
                    file: basename(f),
                    duration
                })
        })
    });
};