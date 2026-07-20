import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Heart, ShoppingCart, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { wishlistProducts, loading, toggleWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const { addToCart } = useCart();

  const handleRemove = async (product) => {
    const id = product.id || product.uuid;
    setRemovingId(id);
    try {
      await toggleWishlist(product);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    const id = product.id || product.uuid;
    setAddingToCartId(id);
    try {
      addToCart(product, 1);
      await toggleWishlist(product);
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 dark:bg-accent-950/30 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-accent-500 fill-accent-500/30" />
            </div>
            My Wishlist
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            {!loading && `${wishlistProducts.length} saved item${wishlistProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {wishlistProducts.length > 0 && (
          <Link to="/products" className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
              <div className="aspect-video bg-secondary-200 dark:bg-secondary-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
                <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                <div className="h-10 bg-secondary-200 dark:bg-secondary-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl transition-colors">
          <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-secondary-300 dark:text-secondary-600" />
          </div>
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Your wishlist is empty</h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2 max-w-xs mx-auto">Browse products and tap the heart icon to save items here.</p>
          <Link to="/products" className="inline-flex items-center gap-2 mt-6 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-6 py-3 rounded-xl transition-colors">
            <ShoppingCart className="w-5 h-5" /> Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {wishlistProducts.map(product => {
              const price = parseFloat(product.price || 0);
              const id = product.id || product.uuid;
              const isRemoving = removingId === id;
              const isMoving = addingToCartId === id;

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <Link to={`/products/${id}`} className="block relative aspect-video overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                    <img
                      src={product.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'; }}
                    />
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(product)}
                      disabled={isRemoving}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-secondary-800/90 text-accent-500 hover:bg-white shadow-sm transition-colors"
                      title="Remove from wishlist"
                    >
                      {isRemoving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <Link to={`/products/${id}`}>
                        <h3 className="font-semibold text-secondary-900 dark:text-white text-sm line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors leading-snug">{product.name}</h3>
                      </Link>
                      {product.category?.name && (
                        <p className="text-xs text-secondary-400 mt-0.5">{product.category.name}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-secondary-900 dark:text-white">GHS {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        {product.compare_price && parseFloat(product.compare_price) > price && (
                          <span className="text-xs text-secondary-400 line-through ml-2">GHS {parseFloat(product.compare_price).toLocaleString()}</span>
                        )}
                      </div>
                      <span className={`text-xxs px-2 py-0.5 rounded font-bold uppercase ${
                        product.condition === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{product.condition}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={isMoving}
                        className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                      >
                        {isMoving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Move to Cart</>}
                      </button>
                      <Link
                        to={`/products/${id}`}
                        className="px-3 py-2.5 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
export { Wishlist };
