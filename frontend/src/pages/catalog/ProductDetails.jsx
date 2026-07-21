import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingCart, 
  Scale, 
  Percent, 
  MessageSquare, 
  Heart, 
  MapPin, 
  Calendar, 
  Star, 
  Award,
  ChevronRight
} from 'lucide-react';

const ProductDetails = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productService.getProduct(uuid);
        const data = response.data;
        setProduct(data);
        // Always prefer primary_image, then first gallery image
        const firstImg = data.primary_image || data.images?.[0]?.url || null;
        setActiveImage(firstImg);
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [uuid]);

  if (loading) {
    return <div className="text-center py-20 dark:text-white">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 dark:text-white">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const handleBarterClick = () => {
    navigate('/barter', { state: { targetProduct: product } });
  };

  const handleHPClick = () => {
    navigate('/hire-purchase', { state: { targetProduct: product } });
  };

  const handleChatClick = () => {
    navigate('/messages', { state: { initialSubject: `Inquiry: ${product.name}` } });
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-secondary-900 dark:text-white truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'; }}
            />
          </div>
          {/* Thumbnails — YouTube style */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 bg-white dark:bg-secondary-900 border-2 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${activeImage === img.url ? 'border-primary-500 ring-2 ring-primary-500/20 scale-105' : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300">
              Condition: {product.condition}
            </span>
            <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white mt-3 leading-tight">{product.name}</h1>
            {product.brand?.name && (
              <p className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mt-1">Brand: {product.brand.name}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="p-6 bg-secondary-100 dark:bg-secondary-900/50 rounded-2xl border border-secondary-200/50 dark:border-secondary-800/50 flex justify-between items-center">
            <div>
              <span className="block text-xs text-secondary-500 dark:text-secondary-400 uppercase font-bold tracking-wider">Purchase Price</span>
              <span className="text-3xl font-extrabold text-secondary-900 dark:text-white">
                GHS {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {product.is_negotiable && (
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
                Price Negotiable
              </span>
            )}
          </div>

          {/* Location & Meta info */}
          <div className="space-y-2.5 text-sm text-secondary-600 dark:text-secondary-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>{product.location || 'Accra, Greater Accra Region'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Posted: {new Date(product.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Checkout & Specialized Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-secondary-200 dark:border-secondary-800">
            
            {/* Standard Cart Buy */}
            <button
              onClick={handleAddToCart}
              className="premium-button-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-md shadow-primary-500/20"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>

            {/* Support Message */}
            <button
              onClick={handleChatClick}
              className="premium-button-secondary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5"
            >
              <MessageSquare className="w-5 h-5 text-secondary-600 dark:text-secondary-300" /> Ask Support
            </button>

            {/* Barter Option */}
            {product.available_for_trade && (
              <button
                onClick={handleBarterClick}
                className="w-full border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-colors"
              >
                <Scale className="w-5 h-5" /> Propose Swap / Barter
              </button>
            )}

            {/* HP Option */}
            {product.available_for_hire_purchase && (
              <button
                onClick={handleHPClick}
                className="w-full border border-primary-300 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950/20 text-primary-700 dark:text-primary-400 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-colors"
              >
                <Percent className="w-5 h-5" /> Buy on Installments
              </button>
            )}

            {/* Pre-Order Option */}
            {product.available_for_preorder && (
              <button
                onClick={() => navigate(`/pre-orders/${product.uuid}`)}
                className="w-full border border-orange-300 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-700 dark:text-orange-400 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-colors"
              >
                <Package className="w-5 h-5" /> Reserve Pre-Order
              </button>
            )}

          </div>

          {/* Variations */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-secondary-200 dark:border-secondary-800">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white uppercase tracking-wide">Options</h3>
              {product.variations.map((variation, vIdx) => (
                <div key={vIdx}>
                  <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">{variation.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {variation.options?.map((opt, oIdx) => (
                      <button key={oIdx} className="px-3 py-1.5 border border-secondary-300 dark:border-secondary-600 rounded-lg text-sm font-medium text-secondary-800 dark:text-secondary-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                        {opt.value}{parseFloat(opt.price_delta || 0) !== 0 && ` (${parseFloat(opt.price_delta) > 0 ? '+' : ''}GHS ${parseFloat(opt.price_delta).toFixed(2)})`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Tabs Section: Details, Specifications, Reviews */}
      <div className="border-t border-secondary-200 dark:border-secondary-800 pt-8">
        <div className="flex border-b border-secondary-200 dark:border-secondary-800 gap-6">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none text-secondary-600 dark:text-secondary-400 text-sm md:text-base leading-relaxed">
              {product.description}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden p-6 max-w-xl">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <dl className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="border-b border-secondary-100 dark:border-secondary-800/80 pb-2">
                      <dt className="text-secondary-450 font-medium capitalize">{key}</dt>
                      <dd className="font-semibold text-secondary-900 dark:text-white mt-1">{val}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400 text-sm">No specifications listed for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id || rev.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                          {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                          <span className="text-secondary-900 dark:text-white ml-2">{rev.title}</span>
                        </div>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">By {rev.user?.name || 'Customer'}</p>
                      </div>
                      {rev.is_verified_purchase && (
                        <span className="text-xxs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200/50">
                          <Award className="w-3.5 h-3.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary-650 dark:text-secondary-350 leading-relaxed">{rev.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400 text-sm">No reviews yet. Be the first to leave a review!</p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;
export { ProductDetails };
