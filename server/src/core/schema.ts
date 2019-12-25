import {query, trans} from './data';

interface Schema {
  column: string;
  type: 'text' | 'decimal' | 'integer' | 'date' | 'serial';
  isNull?: boolean;
  isKey?: boolean;
  reference?: string;
}

const audiobook: Array<Schema> = [
  {column: 'id', type: 'text', isNull: false, isKey: true},
  {column: 'title', type: 'text', isNull: false},
  {column: 'subtitle', type: 'text', isNull: false},
  {column: 'description', type: 'text', isNull: false},
  {column: 'image', type: 'text', isNull: false},
  {column: 'author', type: 'text', isNull: false},
  {column: 'folder', type: 'text', isNull: false},
  {column: 'narrator', type: 'text', isNull: false},
  {column: 'runtime', type: 'integer', isNull: false},
  {column: 'language', type: 'text', isNull: false},
  {column: 'link', type: 'text', isNull: false},
  {column: 'stars', type: 'decimal', isNull: false},
  {column: 'ratings', type: 'integer', isNull: false},
  {column: 'year', type: 'date', isNull: false},
  {column: 'lastUpdatedUtc', type: 'date', isNull: false},
  {column: 'dateCreatedUtc', type: 'date', isNull: false},
];

export interface Audiobook {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  folder: string;
  author: string;
  narrator: string;
  runtime: string;
  language: string;
  stars: string;
  ratings: string;
  year: string;
}

const session: Array<Schema> = [
  {column: 'id', type: 'serial', isNull: false, isKey: true},
  {column: 'userId', type: 'text', isNull: false},
  {column: 'fileId', type: 'text', isNull: false, reference: 'file(id)'},
  {column: 'time', type: 'decimal', isNull: false},
];

export interface Session {
  id: number;
  userId: string;
  fileid: string;
  time: number;
}

const file: Array<Schema> = [
  {column: 'id', type: 'text', isNull: false, isKey: true},
  {column: 'bookId', type: 'text', isNull: false, reference: 'audiobook(id)'},
  {column: 'duration', type: 'decimal', isNull: false},
  {column: 'size', type: 'decimal', isNull: false},
  {column: 'bitrate', type: 'decimal', isNull: false},
  {column: 'format', type: 'text', isNull: false},
  {column: 'location', type: 'text', isNull: false},
  {column: 'title', type: 'text', isNull: false},
  {column: 'fileName', type: 'text', isNull: false},
  {column: 'lastUpdatedUtc', type: 'date', isNull: false},
  {column: 'dateCreatedUtc', type: 'date', isNull: false},
];

export interface File {
  id: string;
  bookId: string;
  duration: number;
  size: number;
  bitrate: number;
  format: string;
  location: string;
  title: string;
  filename: string;
}

export const schema = [
  {
    name: 'audiobook',
    schema: audiobook,
  },
  {
    name: 'file',
    schema: file,
  },
  {
    name: 'session',
    schema: session,
  },
];

export const validate = async () => {
  console.log('validating schema');

  for (const s of schema) {
    console.log(`checking schema ${s.name}`);
    const tableExistance = await query(
      'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2);',
      ['public', s.name]
    );
    const exists = tableExistance.rows[0].exists;
    console.log(`schema ${s.name} exists? ${exists}`);

    if (!exists) {
      await trans(async client => {
        await client.query('SET search_path TO schema,public');

        await client.query(
          `CREATE TABLE ${s.name} (${s.schema.map(s => {
            const reference = s.reference ? `REFERENCES ${s.reference}` : '';
            const key = s.isKey ? 'PRIMARY KEY' : '';
            const isNull = s.isNull ? '' : 'NOT NULL';

            return `${s.column} ${s.type} ${isNull} ${key} ${reference}`;
          })})`
        );
      });
    }
  }
};
