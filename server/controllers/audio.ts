import { data } from '../server';

export const list = async (req: any, res: any) => {
    const d = await data.read('SELECT * FROM audiobook', []);
    res.json(d.rows);
};

export const item = async (req: any, res: any) => {
    var id = req.params.id;
    const d = await data.read('SELECT * FROM audiobook WHERE id = $1', [id]);
    res.json(d.rows[0]);
};