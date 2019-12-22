import { query, trans } from "./data";

const audiobook = [
    { column: 'id', type: 'text', isNull: false },
    { column: 'title', type: 'text', isNull: false },
    { column: 'subtitle', type: 'text', isNull: false },
    { column: 'description', type: 'text', isNull: false },
    { column: 'image', type: 'text', isNull: false },
    { column: 'author', type: 'text', isNull: false },
    { column: 'folder', type: 'text', isNull: false },
    { column: 'narrator', type: 'text', isNull: false },
    { column: 'runtime', type: 'integer', isNull: false },
    { column: 'language', type: 'text', isNull: false },    
    { column: 'link', type: 'text', isNull: false },
    { column: 'stars', type: 'decimal', isNull: false },
    { column: 'ratings', type: 'integer', isNull: false },
    { column: 'year', type: 'date', isNull: false },
    { column: 'lastUpdatedUtc', type: 'date', isNull: false},
    { column: 'dateCreatedUtc', type: 'date', isNull: false},
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

const session = [
    { column: 'id', type: 'text', isNull: false },
    { column: 'time', type: 'decimal', isNull: false },
];

export interface Session {
    id: string;
    time: number;
}

export const schema = [
    {
        name: 'audiobook',
        schema: audiobook
    },
    {
        name: 'session',
        schema: session
    }
];

export const validate = async () => {
    console.log('validating schema');
    await Promise.all(schema.map(async s => {
        console.log(`checking schema ${s.name}`);
        const tableExistance = await query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2);', ['public', s.name]);
        const exists = tableExistance.rows[0].exists;
        console.log(`schema ${s.name} exists? ${exists}`);

        if (!exists) {
            await trans(async (client) => {
                await client.query(`CREATE TABLE ${s.name} (${s.schema.map(s => `${s.column} ${s.type} ${!s.isNull ? 'NOT NULL' : ''}`)})`);
            });
        }
    }));
}