import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const { data } = await api.get('/cart');
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      // silent — user may not be logged in yet
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (product_id, quantity = 1) => {
    await api.post('/cart', { product_id, quantity });
    await refreshCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setItems([]);
    setTotal(0);
  };

  return (
    <CartContext.Provider value={{ items, total, refreshCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
