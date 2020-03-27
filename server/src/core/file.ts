import axios from 'axios';
import crypto from 'crypto';
import {readdirSync, statSync} from 'fs';
import path, {join, normalize} from 'path';

import {CONSTANTS} from '../constants';
import {buildInsertQuery, query, trans} from './data';
import {workFiles} from './fileWorker';
import {cleanUp} from './janitor';
import {objectToProps} from './mapper';
import {Audiobook, validate} from './schema';
import {getDetail, getDetailLink, scraper} from './scraper';

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
  await cleanUp(itemsNotInFolder);

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

    const detailLink = await getDetailLink(resp.data);
    const detailResp = await axios.get(detailLink);
    const description = await getDetail(detailResp.data);

    const audiobook = await scraper(
      item.hash,
      resp.data,
      item.folder,
      description,
      detailLink
    );

    const fileData = await workFiles(item.folder, item.hash);

    await trans(async client => {
      const props = objectToProps(audiobook);
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
