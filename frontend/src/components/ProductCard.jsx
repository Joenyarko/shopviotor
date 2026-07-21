import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Percent, ShieldCheck } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';

const ProductCard = ({ product, onWishlistToggle }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id || product.uuid);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
    if (onWishlistToggle) {
      onWishlistToggle(product.id || product.uuid, !wishlisted);
    }
  };

  const conditionColor = (cond) => {
    switch (cond) {
      case 'new': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'refurbished': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  const productPrice = parseFloat(product.price || 0);

  return (
    <div className="group bg-white dark:bg-secondary-900 hover:shadow-lg transition-all duration-300 relative flex flex-col h-full z-0 hover:z-10">
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm border border-secondary-200 dark:border-secondary-700 shadow-sm hover:bg-white dark:hover:bg-secondary-700 z-10 transition-colors"
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-accent-500 text-accent-500' : 'text-secondary-600 dark:text-secondary-400'}`} />
      </button>

      {/* Image Gallery Container */}
      <Link to={`/products/${product.id || product.uuid}`} className="block relative aspect-square overflow-hidden bg-secondary-100 dark:bg-secondary-850">
        <img
          src={product.primary_image || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60';
          }}
        />
        
        {/* Badges Overlay */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          <span className={`text-xxs px-2 py-0.5 font-bold uppercase rounded-md tracking-wider ${conditionColor(product.condition)}`}>
            {product.condition}
          </span>
          {product.available_for_trade && (
            <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xxs px-2 py-0.5 font-bold uppercase rounded-md tracking-wider flex items-center gap-0.5">
              <Scale className="w-3 h-3" /> Barter
            </span>
          )}
          {product.available_for_hire_purchase && (
            <span className="bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 text-xxs px-2 py-0.5 font-bold uppercase rounded-md tracking-wider flex items-center gap-0.5">
              <Percent className="w-3 h-3" /> HP
            </span>
          )}
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product.id || product.uuid}`} className="hover:text-primary-600 dark:hover:text-primary-400">
          <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-2 text-sm md:text-base leading-snug">
            {product.name}
          </h3>
        </Link>
        
        {product.brand?.name && (
          <span className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 font-medium">{product.brand.name}</span>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-secondary-900 dark:text-white">GHS {productPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {product.compare_price && parseFloat(product.compare_price) > productPrice && (
              <span className="text-xs text-secondary-400 line-through">GHS {parseFloat(product.compare_price).toLocaleString('en-US')}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-100 dark:border-secondary-800/80">
            <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{product.location || 'Accra, Ghana'}</span>
            {product.average_rating > 0 && (
              <span className="text-xs flex items-center gap-0.5 text-amber-500 font-semibold">
                ★ {product.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
export { ProductCard };
