import { readdirSync, statSync } from 'fs';
import { join, normalize } from 'path';
import { data } from '../server';
import crypto from 'crypto';
import { Audiobook } from '../contracts/audiobook';
import cheerio from 'cheerio';
import axios from 'axios';
import { CONSTANTS } from '../constants';


const dirs = (path: string) => readdirSync(path)
    .filter(f => statSync(join(path, f))
    .isDirectory())

const fileSync = () => {
    // check if there are any new files...
    const path = join(__dirname, `../${CONSTANTS.folderPath}`);
    console.log(`checking path: ${path}`);
    const files = dirs(path);
    console.log(`found ${files.length} files...`);
    return files.map(f => normalize(`${path}/${f}`));
};

const schema = [
    { column: 'id', type: 'text', isNull: false },
    { column: 'title', type: 'text', isNull: false },
    { column: 'subtitle', type: 'text', isNull: false },
    { column: 'folder', type: 'text', isNull: false },
    { column: 'image', type: 'text', isNull: false },
    { column: 'author', type: 'text', isNull: false },
    { column: 'narrator', type: 'text', isNull: false },
    { column: 'runtime', type: 'text', isNull: false },
    { column: 'language', type: 'text', isNull: false },
    { column: 'stars', type: 'text', isNull: false },
    { column: 'ratings', type: 'text', isNull: false },
    { column: 'year', type: 'text', isNull: false }
];

export const init = async () => {
    const files = fileSync();
    const hashes = files.map(f => ({ folder: f, hash: crypto.createHash('md5').update(f).digest('hex') }));

    const exists = await data.read('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2);', ['public', 'audiobook']);

    if (!exists.rows[0].exists) {
        console.log('audiobook table not found... creating...')
        await data.transaction(async (client) => {
            await client.query(`CREATE TABLE audiobook (${schema.map(s => `${s.column} ${s.type} ${!s.isNull ? 'NOT NULL' : ''}`)})`);
        });
    }

    const dbItems = await data.read('SELECT * FROM audiobook', []);
    const itemsNotInDb = hashes.filter(i => !(dbItems.rows as Array<Audiobook>).map(r => r.id).includes(i.hash));

    console.log(`found ${itemsNotInDb.length} items not in db...`);

    console.log('fetching metadata');

    const promises: Array<Promise<void>> = [];

    itemsNotInDb.forEach(item => {
        console.log(`checking ${item.folder}`);
        const keywords = item.folder.split('\\').pop().replace('.mp3', '').trim();
        console.log(`hitting ${keywords}`);

        const promise = async () => {
            const resp = await axios.get(`https://www.audible.com/search?keywords=${keywords}`);
            const $ = cheerio.load(resp.data);
            const items = $('.productListItem');

            const findTarget = (node: Cheerio, target: string) => {
                try {
                    return $(node).find(target)[0].children.pop().data;
                } catch (e) {
                    console.log(`unable to find ${target} for ${item.folder}`);
                    return '';
                }
            };
            const findMany = (node: Cheerio, target: string) => $(node).find(target);

            const searchSchema = [
                { name: 'year', target: '.releaseDateLabel span', multi: false },
                { name: 'title', target: '.bc-list-item h3 a', multi: false },
                { name: 'subtitle', target: '.subtitle span', multi: false },
                { name: 'author', target: '.authorLabel span a', multi: true },
                { name: 'narrator', target: '.narratorLabel span a', multi: false },
                { name: 'runtime', target: '.runtimeLabel span', multi: false },
                { name: 'language', target: '.languageLabel span', multi: false },
                { name: 'stars', target: '.ratingsLabel .bc-pub-offscreen', multi: false },
                { name: 'ratings', target: '.ratingsLabel .bc-color-secondary', multi: false },
            ]
            const props: Array<{ prop: string, value: string }> = [
                {
                    prop: 'id',
                    value: item.hash
                }, {
                    prop: 'folder', 
                    value: item.folder
                }
            ];

            const img = $(items).find('.responsive-product-square img')[0].attribs['src'];
            props.push({
                prop: 'image', value: img
            });

            searchSchema.forEach(ss => {
                if (!ss.multi) {
                    const item = findTarget(items, ss.target).split(':').pop().trim();
                    console.log(`${ss.name}: ${item}`);
                    props.push({ prop: ss.name, value: item });
                } else {
                    const i = findMany(items, ss.target);
                    const arr = i.toArray().map(d => d.children.map(c => c.data)).reduce((acc, val) => acc.concat(val), []);
                    props.push({ prop: ss.name, value: arr.join(', ') });
                }
            });

            data.transaction((client) => {
                const queryText = `INSERT INTO audiobook(${props.map(p => p.prop)}) VALUES(${props.map((p, i) => `$${i + 1}`)})`;
                client.query(queryText, props.map(p => p.value))
            });
        }

        promises.push(promise());

    });

    await Promise.all(promises);
};

