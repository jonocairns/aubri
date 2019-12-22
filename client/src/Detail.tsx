import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Player from './Player';
import { Crumb } from './Breadcrumb';
import { Audiobook } from '../../server/core/schema';

const Detail: React.FC = () => {
    const [book, setBook] = useState<Audiobook | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    const fetchData = async () => {
        const resp = await fetch(`http://localhost:6969/api/audio/${id}`);
        const data = await resp.json();
        setBook(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading || !book) {
        return null;
    }

    return (
        <div className="container d-flex flex-wrap">
            <div className="col-12"><Crumb items={[{ link: '/', label: 'Library' }, { link: `/${book.id}`, label: book.title, active: true }]}/></div>
            <div className="col-12 col-md-4">
                <img src={book.image} className="img-fluid" />
            </div>
            <div className="col-12 col-md-8 text-light">
                <h3>{book.title}</h3>

                <p>{book.subtitle}</p>
                <p>Written by: {book.author}</p>
                <p>Narrated by: {book.narrator}</p>
                <p>{book.stars} with {book.ratings}</p>
                <p>{book.runtime}</p>

                <div className="list-group">
                    {(book as any).files.map((f: any) => (
                        <Player title={f.file} id={book.id} file={f.file} duration={f.duration}/>
                    ))}
                </div>


            </div>
        </div>
    );
}

export default Detail;
