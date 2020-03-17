import {DBSchema, openDB} from 'idb';

interface MyDB extends DBSchema {
  books: {
    value: {
      blob: Blob;
    };
    key: string;
    indexes: {};
  };
}

export const save = async (blob: Blob, key: string) => {
  const db = await openDB<MyDB>('my-db', 1, {
    upgrade(db) {
      db.createObjectStore('books');
    },
  });

  await db.put('books', {blob}, key);
};

export const remove = async (key: string) => {
  const db = await openDB<MyDB>('my-db', 1, {
    upgrade(db) {
      db.createObjectStore('books');
    },
  });

  await db.delete('books', key);
};

export const get = async (key: string) => {
  const db = await openDB<MyDB>('my-db', 1, {
    upgrade(db) {
      db.createObjectStore('books');
    },
  });

  const result = await db.get('books', key);

  if (result) {
    return URL.createObjectURL(result.blob);
  }

  return result;
};
