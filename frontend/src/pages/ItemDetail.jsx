import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiConfig } from '../config/appConfig';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setItem(null);

    fetch(`${apiConfig.baseUrl}/items/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Item not found' : 'Failed to load item');
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!active || err.name === 'AbortError') return;
        setError(err.message || 'Failed to load item');
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>
        <Link to="/">Back to items</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
      <p style={{ marginTop: 16 }}>
        <Link to="/">Back to items</Link>
      </p>
    </div>
  );
}

export default ItemDetail;
