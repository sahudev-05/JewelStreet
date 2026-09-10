import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load cart: from server if logged in, else localStorage
  useEffect(() => {
    if (user) {
      axios.get('/api/cart')
        .then(res => setCartItems(res.data))
        .catch(() => setCartItems([]));
    } else {
      const local = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(local);
    }
  }, [user]);

  const addToCart = async (product) => {
    const targetId = String(product.productId || product.id);
    const itemToAdd = { ...product, productId: targetId };

    setCartItems(prev => {
      if (prev.some(i => String(i.productId || i.id) === targetId)) return prev;
      const updated = [...prev, itemToAdd];
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        const res = await axios.post('/api/cart/add', itemToAdd);
        if (res.data && Array.isArray(res.data)) {
          setCartItems(res.data);
          localStorage.setItem('cart', JSON.stringify(res.data));
        }
      } catch (e) {
        console.warn('API cart add fallback to local:', e.message);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const targetId = String(productId);
    setCartItems(prev => {
      const updated = prev.filter(i => String(i.productId || i.id) !== targetId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        const res = await axios.delete(`/api/cart/remove/${targetId}`);
        if (res.data && Array.isArray(res.data)) {
          setCartItems(res.data);
          localStorage.setItem('cart', JSON.stringify(res.data));
        }
      } catch (e) {
        console.warn('API cart remove fallback to local:', e.message);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    if (user) {
      try {
        await axios.delete('/api/cart/clear');
      } catch (e) {
        console.warn('API clear cart error:', e.message);
      }
    }
  };

  const updateCartItemPurity = (productId, newQuality) => {
    const updated = cartItems.map(item => {
      if (String(item.productId || item.id) === String(productId)) {
        const match = item.price?.match(/[\d,]+/);
        const currentPriceNum = match ? parseInt(match[0].replace(/,/g, '')) : 0;
        const currentIs75 = item.purity?.includes('75') || item.purity?.includes('18K');
        
        const base22KPrice = item.base22KPrice || (currentIs75 ? Math.round(currentPriceNum / 0.8514) : currentPriceNum);
        
        let updatedPriceNum = base22KPrice;
        let purityText = '22K (91.6% Pure Gold)';
        if (newQuality === '75') {
          updatedPriceNum = Math.round(base22KPrice * 0.8514);
          purityText = '18K (75.0% Pure Gold)';
        }
        
        return {
          ...item,
          base22KPrice,
          purity: `Purity: ${purityText}`,
          quality: newQuality,
          price: `₹${updatedPriceNum.toLocaleString('en-IN')}`,
        };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const isInCart = (productId) => cartItems.some(i => String(i.productId || i.id) === String(productId));

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, updateCartItemPurity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
