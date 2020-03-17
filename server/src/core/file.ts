import axios from 'axios';
import cheerio from 'cheerio';
import crypto from 'crypto';
import ffmpeg, {FfprobeData} from 'fluent-ffmpeg';
import {readdirSync, statSync} from 'fs';
import path, {basename, join, normalize} from 'path';
import {promisify} from 'util';

import {CONSTANTS} from '../constants';
import {readDirAsync, strongHash} from '../controllers/audio';
import {buildInsertQuery, query, trans} from './data';
import {Audiobook, validate} from './schema';
import {searchSchema} from './searchSchema';

const probeP = promisify(ffmpeg.ffprobe);

const dirs = (path: string) =>
  readdirSync(path).filter(f => statSync(join(path, f)).isDirectory());

const fileSync = () => {
  // check if there are any new files...
  const path = CONSTANTS.folderPath;
  console.log(`checking path: ${path}`);
  const files = dirs(path);
  console.log(`found ${files.length} files...`);
  return files.map(f => normalize(`${path}/${f}`));
};

const weakHash = (input: string) =>
  crypto
    .createHash('md5')
    .update(input)
    .digest('hex');

export const init = async () => {
  const files = fileSync();
  const hashes = files.map(f => ({
    folder: f,
    hash: weakHash(f),
  }));

  await validate();

  const dbItems = await query('SELECT * FROM audiobook', []);
  const itemsNotInDb = hashes.filter(
    i => !(dbItems.rows as Array<Audiobook>).map(r => r.id).includes(i.hash)
  );

  const itemsNotInFolder = (dbItems.rows as Array<Audiobook>)
    .map(r => r.id)
    .filter(f => !hashes.map(h => h.hash).includes(f));

  console.log(
    `found ${itemsNotInFolder.length} items that need to be removed as they don't exist in the folder anymore`
  );

  const promises = [];
  itemsNotInFolder.forEach(f => {
    const promise = trans(async c => {
      const file = c.query('SELECT * FROM audiobook where id = $1', [f]);

      const result = (await file).rows[0];
      console.log(`deleting ${result.title}`);
      c.query('DELETE FROM session WHERE fileid = $1', [result.id]);
      c.query('DELETE FROM audiobook WHERE id = $1', [f]);
      c.query('DELETE FROM file WHERE bookid = $1', [f]);
    });

    promises.push(promise);
  });

  console.log(`found ${itemsNotInDb.length} items not in db...`);

  console.log('fetching metadata if required...');

  const allItemPromises = itemsNotInDb.map(async item => {
    console.log(`checking ${item.folder}`);

    const keywords = item.folder
      .split(path.sep)
      .pop()
      .trim();
    console.log(`hitting ${keywords}`);

    const resp = await axios.get(
      `https://www.audible.com/search?keywords=${keywords}`
    );
    const $ = cheerio.load(resp.data);
    const items = $('.productListItem');

    const findTarget = (node: Cheerio, target: string) => {
      try {
        return $(node)
          .find(target)[0]
          .children.pop().data;
      } catch (e) {
        return '';
      }
    };
    const findMany = (node: Cheerio, target: string) => $(node[0]).find(target);

    const props: Array<{prop: string; value: string}> = [
      {
        prop: 'id',
        value: item.hash,
      },
      {
        prop: 'folder',
        value: item.folder,
      },
    ];

    const img = $(items).find('.responsive-product-square img')[0]?.attribs[
      'src'
    ];
    props.push({
      prop: 'image',
      value: img || '',
    });

    const detailLink =
      $(items)
        .find('.bc-list-item h3 a')[0]
        ?.attribs['href']?.split('?')
        ?.shift() || '';
    const fullLink = `https://www.audible.com${detailLink}`;

    props.push({
      prop: 'link',
      value: fullLink,
    });

    const detailResp = await axios.get(fullLink);
    const targeter = cheerio.load(detailResp.data);

    const description =
      targeter('.productPublisherSummary')
        .find('.bc-text')
        .html() || '';

    props.push({
      prop: 'description',
      value: description,
    });

    props.push({
      prop: 'lastUpdatedUtc',
      value: new Date().toISOString(),
    });

    props.push({
      prop: 'dateCreatedUtc',
      value: new Date().toISOString(),
    });

    searchSchema.forEach(ss => {
      if (!ss.multi) {
        const item = findTarget(items, ss.target)
          .split(':')
          .pop()
          .trim();

        if (ss.translate) {
          const transLatedItem = ss.translate(item);
          props.push({prop: ss.name, value: transLatedItem as string});
        } else {
          props.push({prop: ss.name, value: item});
        }
      } else {
        const i = findMany(items, ss.target);
        const arr = i
          .toArray()
          .map(d => d.children.map(c => c.data))
          .reduce((acc, val) => acc.concat(val), []);
        props.push({prop: ss.name, value: arr.join(', ')});
      }
    });

    const files = await readDirAsync(item.folder);

    const filePromises = files.map(async file => {
      const meta = (await probeP(file)) as FfprobeData;

      const h = strongHash(`${item.hash}${file}`);

      const tags = meta.format.tags as {title?: string};

      return [
        {
          prop: 'id',
          value: h,
        },
        {
          prop: 'bookId',
          value: item.hash,
        },
        {
          prop: 'duration',
          value: meta.format.duration,
        },
        {
          prop: 'size',
          value: meta.format.size,
        },
        {
          prop: 'bitrate',
          value: meta.format.bit_rate,
        },
        {
          prop: 'format',
          value: meta.format.format_name,
        },
        {
          prop: 'dateCreatedUtc',
          value: new Date().toISOString(),
        },
        {
          prop: 'lastUpdatedUtc',
          value: new Date().toISOString(),
        },
        {
          prop: 'location',
          value: file,
        },
        {
          prop: 'fileName',
          value: basename(file),
        },
        {
          prop: 'title',
          value: (tags && tags.title) || '',
        },
      ];
    });

    const fileData = await Promise.all(filePromises);

    await trans(async client => {
      const audioBookQuery = buildInsertQuery('audiobook', props);

      await client.query('SET search_path TO schema,public;');

      await client.query(
        audioBookQuery,
        props.map(p => p.value)
      );

      const fileDataPromises = fileData.map(async fd => {
        const fileQuery = buildInsertQuery('file', fd);
        await client.query(
          fileQuery,
          fd.map(p => p.value)
        );
      });

      await Promise.all(fileDataPromises);
    });
  });

  await Promise.all(allItemPromises);

  console.log('init complete...');
};
