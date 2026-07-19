import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, LogIn } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, cartItemsCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-secondary-500 text-center mb-8 max-w-md">
          Looks like you haven't added any products to your cart yet. Let's change that!
        </p>
        <Link to="/products" className="premium-button-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2">
          Start Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-secondary-900 dark:text-white flex items-center gap-3">
        Shopping Cart <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm py-1 px-3 rounded-full">{cartItemsCount} Items</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3 space-y-4">
          {cart.map((item) => (
            <div key={item.product_id || item.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-24 h-24 flex-shrink-0 bg-secondary-100 dark:bg-secondary-800 rounded-xl overflow-hidden">
                <img 
                  src={item.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop'} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop'; }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id || item.id}`} className="text-lg font-bold text-secondary-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <div className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                  GHS {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                <div className="flex items-center border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800">
                  <button 
                    onClick={() => updateQuantity(item.product_id || item.id, item.quantity - 1)}
                    className="p-2 text-secondary-500 hover:text-secondary-900 dark:hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product_id || item.id, item.quantity + 1)}
                    disabled={item.quantity >= (item.stock_quantity || 100)}
                    className="p-2 text-secondary-500 hover:text-secondary-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.product_id || item.id)}
                  className="p-2 text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/30 rounded-lg transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-secondary-200 dark:border-secondary-800">
              <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                <span>Subtotal ({cartItemsCount} items)</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                <span>Shipping</span>
                <span className="text-sm">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                GHS {cartSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full premium-button-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login?redirect=/checkout"
                  className="w-full premium-button-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogIn className="w-5 h-5" /> Login to Checkout
                </Link>
                <p className="text-center text-xs text-secondary-500">
                  Your cart items will be saved. <Link to="/register" className="text-primary-500 hover:underline font-semibold">Create an account</Link> to get started.
                </p>
              </div>
            )}
            
            <Link to="/products" className="block text-center mt-4 text-sm text-secondary-500 hover:text-primary-500 font-semibold transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
