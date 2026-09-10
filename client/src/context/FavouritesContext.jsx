import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState(() => {
    try {
      const local = localStorage.getItem('favourites');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      axios.get('/api/favourites')
        .then(res => {
          if (Array.isArray(res.data)) {
            setFavourites(res.data);
            localStorage.setItem('favourites', JSON.stringify(res.data));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const isFavourited = (productId) => {
    if (productId === undefined || productId === null) return false;
    const target = String(productId);
    return favourites.some(item => {
      const id = String(item.productId || item.id || item._id || '');
      return id === target;
    });
  };

  const toggleFavourite = async (product) => {
    if (!product) return;
    const targetId = String(product.productId || product.id || product._id || '');
    if (!targetId) return;

    const exists = isFavourited(targetId);
    let updated;
    if (exists) {
      updated = favourites.filter(item => String(item.productId || item.id || item._id || '') !== targetId);
    } else {
      updated = [...favourites, { ...product, id: targetId, productId: targetId }];
    }

    setFavourites(updated);
    localStorage.setItem('favourites', JSON.stringify(updated));

    if (user) {
      try {
        const res = await axios.post('/api/favourites/toggle', product);
        if (res.data && Array.isArray(res.data.items)) {
          setFavourites(res.data.items);
          localStorage.setItem('favourites', JSON.stringify(res.data.items));
        }
      } catch (e) {
        console.error('Backend favourite sync warning:', e);
      }
    }
  };

  const removeFromFavourites = async (productId) => {
    if (productId === undefined || productId === null) return;
    const targetId = String(productId);

    const updated = favourites.filter(item => String(item.productId || item.id || item._id || '') !== targetId);
    setFavourites(updated);
    localStorage.setItem('favourites', JSON.stringify(updated));

    if (user) {
      try {
        const res = await axios.post('/api/favourites/toggle', { productId: targetId });
        if (res.data && Array.isArray(res.data.items)) {
          setFavourites(res.data.items);
          localStorage.setItem('favourites', JSON.stringify(res.data.items));
        }
      } catch (e) {
        console.error('Backend favourite sync warning:', e);
      }
    }
  };

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourited, removeFromFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);

