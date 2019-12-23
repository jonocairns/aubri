import axios from 'axios';
import cheerio from 'cheerio';
import crypto from 'crypto';
import {readdirSync, statSync} from 'fs';
import {join, normalize} from 'path';

import {CONSTANTS} from '../constants';
import {query, trans} from './data';
import {Audiobook, validate} from './schema';

const dirs = (path: string) =>
  readdirSync(path).filter(f => statSync(join(path, f)).isDirectory());

const fileSync = () => {
  // check if there are any new files...
  const path = join(__dirname, `../${CONSTANTS.folderPath}`);
  console.log(`checking path: ${path}`);
  const files = dirs(path);
  console.log(`found ${files.length} files...`);
  return files.map(f => normalize(`${path}/${f}`));
};

export const init = async () => {
  const files = fileSync();
  const hashes = files.map(f => ({
    folder: f,
    hash: crypto
      .createHash('md5')
      .update(f)
      .digest('hex'),
  }));

  await validate();

  const dbItems = await query('SELECT * FROM audiobook', []);
  const itemsNotInDb = hashes.filter(
    i => !(dbItems.rows as Array<Audiobook>).map(r => r.id).includes(i.hash)
  );

  console.log(`found ${itemsNotInDb.length} items not in db...`);

  console.log('fetching metadata');

  const promises: Array<Promise<void>> = [];

  itemsNotInDb.forEach(item => {
    console.log(`checking ${item.folder}`);
    const keywords = item.folder
      .split('\\')
      .pop()
      .replace('.mp3', '')
      .trim();
    console.log(`hitting ${keywords}`);

    const promise = async () => {
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
      const findMany = (node: Cheerio, target: string) => $(node).find(target);

      const searchSchema = [
        {
          name: 'year',
          target: '.releaseDateLabel span',
          multi: false,
          translate: (item: string): string => new Date(item).toISOString(),
        },
        {name: 'title', target: '.bc-list-item h3 a', multi: false},
        {name: 'subtitle', target: '.subtitle span', multi: false},
        {name: 'author', target: '.authorLabel span a', multi: true},
        {name: 'narrator', target: '.narratorLabel span a', multi: false},
        {
          name: 'runtime',
          target: '.runtimeLabel span',
          multi: false,
          translate: (searchItem: string): number =>
            searchItem
              .split(' ')
              .filter(r => !isNaN(r as any))
              .map(a => Number(a))
              .map((a, i) => (i === 0 ? a * 60 : a))
              .reduce((a, b) => a + b, 0) || 0,
        },
        {name: 'language', target: '.languageLabel span', multi: false},
        {
          name: 'stars',
          target: '.ratingsLabel .bc-pub-offscreen',
          multi: false,
          translate: (item: string): number =>
            Number(item.split(' ').shift()) || 0,
        },
        {
          name: 'ratings',
          target: '.ratingsLabel .bc-color-secondary',
          multi: false,
          translate: (item: string): number =>
            Number(
              item
                .replace(/,/g, '')
                .split(' ')
                .shift()
            ) || 0,
        },
      ];

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

      const img = $(items).find('.responsive-product-square img')[0].attribs[
        'src'
      ];
      props.push({
        prop: 'image',
        value: img,
      });

      const detailLink = $(items)
        .find('.bc-list-item h3 a')[0]
        .attribs['href'].split('?')
        .shift();
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
            props.push({prop: ss.name, value: transLatedItem as any});
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

      trans(client => {
        const queryText = `INSERT INTO audiobook(${props.map(
          p => p.prop
        )}) VALUES(${props.map((p, i) => `$${i + 1}`)})`;
        client.query(
          queryText,
          props.map(p => p.value)
        );
      });
    };

    promises.push(promise());
  });

  await Promise.all(promises);
};
