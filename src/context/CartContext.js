import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'hotelCart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (room, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.room._id === room._id);
      if (existing) {
        return prev.map((item) => item.room._id === room._id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { room, quantity, checkIn: '', checkOut: '', adults: 1, children: 0, customAmount: 0, paymentMethod: 'card', paymentStatus: 'paid', checkInTime: '', checkOutTime: '' }];
    });
  };

  const updateItem = (roomId, updates) => {
    setItems((prev) => prev.map((item) => item.room._id === roomId ? { ...item, ...updates } : item));
  };

  const removeItem = (roomId) => {
    setItems((prev) => prev.filter((item) => item.room._id !== roomId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.room.price * item.quantity * (Math.max(1, Math.ceil((new Date(item.checkOut || new Date()).getTime() - new Date(item.checkIn || new Date()).getTime()) / 86400000)) || 1), 0), [items]);
  const gst = useMemo(() => parseFloat((subtotal * 0.12).toFixed(2)), [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, subtotal, gst, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
