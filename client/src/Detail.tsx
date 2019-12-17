import React, { useState, useEffect } from 'react';
import { Audiobook } from '../../server/contracts/audiobook';
import { useParams } from 'react-router-dom';
import Player from './Player';

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
        <div className="d-flex mt-4">
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


                {(book as any).files.map((f: string) => (
                    <>{f} - <Player id={book.id} file={f} /></>
                ))}
            </div>
        </div>
    );
}

export default Detail;
