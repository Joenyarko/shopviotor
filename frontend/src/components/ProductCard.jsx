import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Percent, ShieldCheck, Store, BadgeCheck } from 'lucide-react';
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
      case 'new': return 'bg-emerald-500 text-white';
      case 'refurbished': return 'bg-blue-500 text-white';
      default: return 'bg-amber-500 text-white';
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
          loading="lazy"
          src={product.primary_image || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60';
          }}
        />
        
        {/* Badges Overlay */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
          <span className={`text-[9px] px-1.5 py-1 font-bold uppercase rounded tracking-wider leading-none shadow-sm ${conditionColor(product.condition)}`}>
            {product.condition === 'new' ? 'New' : 'Used'}
          </span>
          {product.shipping_type === 'free' && (
            <span className="bg-green-600 text-white text-[9px] px-1.5 py-1 font-bold uppercase rounded tracking-wider flex items-center gap-0.5 leading-none shadow-sm" title="Free Shipping">
              Free Shipping
            </span>
          )}
          {product.available_for_trade && (
            <span className="bg-purple-600 text-white text-[9px] px-1.5 py-1 font-bold uppercase rounded tracking-wider flex items-center gap-0.5 leading-none shadow-sm" title="Available for Trade by Barter">
              <Scale className="w-2.5 h-2.5" /> Barter
            </span>
          )}
          {product.available_for_hire_purchase && (
            <span className="bg-primary-500 text-white text-[9px] px-1.5 py-1 font-bold uppercase rounded tracking-wider flex items-center gap-0.5 leading-none shadow-sm" title="Available for Hire Purchase">
              <Percent className="w-2.5 h-2.5" /> HP
            </span>
          )}
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="mb-1">
          {product.store && (
            <Link to={`/shops/${product.store.slug || product.store.id}`} className={`inline-flex items-center gap-1 text-[10px] font-bold mb-1 hover:underline ${product.store.is_verified ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500'}`}>
              {product.store.is_verified ? <BadgeCheck className="w-3 h-3 text-blue-500" /> : <Store className="w-3 h-3" />} Sold by {product.store.name}
            </Link>
          )}
          <Link to={`/products/${product.id || product.uuid}`} className="hover:text-primary-600 dark:hover:text-primary-400">
            <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-2 text-xs md:text-sm leading-snug">
              {product.name}
            </h3>
          </Link>
          {product.brand && (
            <p className="text-xs text-secondary-500 mt-0.5">{product.brand.name}</p>
          )}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-sm md:text-base font-bold text-secondary-900 dark:text-white">GHS {productPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {parseFloat(product.compare_price) > productPrice && (
              <span className="text-xs text-secondary-400 line-through">GHS {parseFloat(product.compare_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-secondary-500">
              <span className="truncate max-w-[100px]">{product.city || 'Accra'}, {product.region || 'Ghana'}</span>
            </div>
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
