import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('viotor_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('viotor_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.id || item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          (item.product_id === product.id || item.id === product.id)
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity || 100) }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product_id: product.id,
          id: product.id, // compatibility fallback
          name: product.name,
          price: parseFloat(product.price),
          sku: product.sku,
          quantity,
          primary_image: product.primary_image || (product.images?.[0]?.url) || null,
          stock_quantity: product.stock_quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId && item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.product_id === productId || item.id === productId)
          ? { ...item, quantity: Math.min(quantity, item.stock_quantity || 100) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
