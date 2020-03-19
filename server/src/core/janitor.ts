import {trans} from './data';

export const cleanUp = async (itemsNotInFolder: Array<string>) => {
  const promises: Array<Promise<void>> = [];
  itemsNotInFolder.forEach(f => {
    const promise = trans(async c => {
      const file = await c.query('SELECT * FROM audiobook where id = $1', [f]);

      const result = (await file).rows[0];

      const files = await c.query('SELECT * FROM file WHERE bookid = $1', [f]);

      const fileIds = files.rows.map(f => f.id);

      console.log(`deleting ${result.title}`);
      await c.query(
        `DELETE FROM session WHERE fileid IN (${fileIds.map(
          (f, i) => `$${i + 1}`
        )})`,
        fileIds
      );

      await c.query('DELETE FROM file WHERE bookid = $1', [f]);
      await c.query('DELETE FROM audiobook WHERE id = $1', [f]);
    });

    promises.push(promise);
  });

  return promises;
};
