import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { toast } from 'react-toastify';
import { 
  ShoppingCart, 
  Scale, 
  Percent, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Star, 
  ChevronRight,
  Package,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store as StoreIcon,
  ThumbsUp,
  Clock
} from 'lucide-react';

const DeliveryInfoCard = () => (
  <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
    <div className="px-5 py-3 border-b border-secondary-200 dark:border-secondary-800">
      <h3 className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wide">Delivery & Returns</h3>
    </div>
    <div className="p-5 space-y-5">
      <div className="flex gap-4">
        <div className="mt-0.5"><Truck className="w-6 h-6 text-primary-500" /></div>
        <div>
          <h4 className="font-semibold text-sm text-secondary-900 dark:text-white">Door Delivery</h4>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Delivery expected between <span className="font-semibold">3-5 business days</span> if you order now.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="mt-0.5"><MapPin className="w-6 h-6 text-primary-500" /></div>
        <div>
          <h4 className="font-semibold text-sm text-secondary-900 dark:text-white">Pickup Station</h4>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Pickup available at various locations nationwide. Fees may vary.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="mt-0.5"><RotateCcw className="w-6 h-6 text-primary-500" /></div>
        <div>
          <h4 className="font-semibold text-sm text-secondary-900 dark:text-white">Return Policy</h4>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Free return within 7 days for eligible items.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="mt-0.5"><ShieldCheck className="w-6 h-6 text-primary-500" /></div>
        <div>
          <h4 className="font-semibold text-sm text-secondary-900 dark:text-white">Warranty</h4>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Guaranteed authentic and original products.</p>
        </div>
      </div>
    </div>
  </div>
);

const SellerInfoCard = ({ store, navigate, product }) => {
  if (!store) {
    return (
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-3">
          <StoreIcon className="w-6 h-6 text-secondary-400" />
        </div>
        <h4 className="font-bold text-sm text-secondary-900 dark:text-white">Viotor Official</h4>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 mb-4">Direct from Viotor platform</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center">
        <h3 className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wide">Seller Information</h3>
        <ChevronRight className="w-4 h-4 text-secondary-400" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden flex-shrink-0">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary-400">
                <StoreIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-secondary-900 dark:text-white truncate max-w-[150px]">{store.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded font-semibold">Official Store</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary-50 dark:bg-secondary-800/50 p-2 rounded-lg text-center">
            <span className="block font-bold text-sm text-secondary-900 dark:text-white">95%</span>
            <span className="block text-[10px] text-secondary-500 uppercase tracking-wider mt-0.5">Seller Score</span>
          </div>
          <div className="bg-secondary-50 dark:bg-secondary-800/50 p-2 rounded-lg text-center">
            <span className="block font-bold text-sm text-secondary-900 dark:text-white">10K+</span>
            <span className="block text-[10px] text-secondary-500 uppercase tracking-wider mt-0.5">Followers</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/stores/${store.slug}`)}
          className="w-full py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
        >
          Visit Store
        </button>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [layawayModalOpen, setLayawayModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productService.getProduct(uuid);
        const data = response.data;
        setProduct(data);
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
    toast.success(`${product.name} added to cart!`);
  };

  const handleLayawayRegistration = async () => {
    try {
      await apiClient.post('/layaways', { product_uuid: product.uuid || product.id });
      toast.success('Layaway plan registered successfully!');
      setLayawayModalOpen(false);
      navigate('/my-layaways');
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to register for layaway.');
    }
  };

  const handleOpenLayawayModal = () => {
    if (!user) {
      toast.error('Please login to start a layaway plan.');
      navigate('/login');
      return;
    }
    setAcceptedTerms(false);
    setLayawayModalOpen(true);
  };

  // Calculate current price based on variations if applicable
  let displayPrice = parseFloat(product.price);
  Object.values(selectedVariations).forEach(opt => {
    if (opt && opt.price_delta) displayPrice += parseFloat(opt.price_delta);
  });

  const discountPercent = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price)
    ? Math.round(((parseFloat(product.compare_price) - parseFloat(product.price)) / parseFloat(product.compare_price)) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
        {product.category?.name && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/products?category=${product.category.slug || product.category.id}`} className="hover:text-primary-600 transition-colors">{product.category.name}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-secondary-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Main Content Area (Left) */}
        <div className="flex-1 w-full space-y-6">
          
          {/* TOP SECTION: Images & Info Split */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-[4/5] bg-secondary-50 dark:bg-secondary-800 rounded-xl overflow-hidden relative group">
                  <img
                    src={activeImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60'; }}
                  />
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discountPercent > 0 && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Thumbnails */}
                {product.images && product.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(img.url)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 bg-secondary-50 dark:bg-secondary-800 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${activeImage === img.url ? 'border-2 border-primary-500 ring-2 ring-primary-500/20' : 'border-2 border-transparent hover:border-primary-300'}`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-center text-xs text-secondary-500 pt-2 border-t border-secondary-100 dark:border-secondary-800">
                  <p>Hover on main image to zoom in</p>
                </div>
              </div>

              {/* Core Information */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-900 dark:text-white leading-tight">{product.name}</h1>
                  </div>
                  {product.brand && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
                      Brand: <span className="text-primary-600 font-semibold">{product.brand.name}</span> | <span className="hover:underline cursor-pointer">Similar products from {product.brand.name}</span>
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= (parseFloat(product.average_rating) || 0) ? 'fill-current' : 'text-secondary-300 dark:text-secondary-700'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-primary-600 hover:underline cursor-pointer">
                      ({product.reviews_count} verified ratings)
                    </span>
                  </div>
                </div>

                <hr className="border-secondary-200 dark:border-secondary-800" />

                {/* Price Block */}
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-extrabold text-secondary-900 dark:text-white">
                      GHS {displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base text-secondary-500 line-through">
                        GHS {parseFloat(product.compare_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded">
                        -{discountPercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Variations */}
                {product.variations && product.variations.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {product.variations.map((variation) => (
                      <div key={variation.id}>
                        <h4 className="text-sm font-bold text-secondary-900 dark:text-white uppercase tracking-wider mb-2">{variation.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {variation.options?.map((opt) => {
                            const isSelected = selectedVariations[variation.id]?.id === opt.id;
                            const hasPriceDelta = parseFloat(opt.price_delta) !== 0;
                            return (
                              <button 
                                key={opt.id} 
                                onClick={() => setSelectedVariations(prev => ({...prev, [variation.id]: opt}))}
                                className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all ${isSelected ? 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400' : 'border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:border-orange-300 hover:text-orange-500'}`}
                              >
                                {opt.value}
                                {hasPriceDelta && <span className="ml-1 opacity-80 text-xs">({parseFloat(opt.price_delta) > 0 ? '+' : ''}{parseFloat(opt.price_delta).toFixed(2)})</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto space-y-3 pt-6">
                  {/* Primary Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full premium-button-primary shadow-lg shadow-primary-500/25 py-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
                  >
                    <ShoppingCart className="w-6 h-6" /> ADD TO CART
                  </button>
                  
                  {/* Specialized Actions Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {product.available_for_hire_purchase && (
                      <button onClick={() => navigate('/hire-purchase', { state: { targetProduct: product } })} className="w-full border-2 border-primary-100 dark:border-primary-900/30 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-700 dark:text-primary-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <Percent className="w-4 h-4" /> Installments
                      </button>
                    )}
                    {product.available_for_trade && (
                      <button onClick={() => navigate('/barter', { state: { targetProduct: product } })} className="w-full border-2 border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <Scale className="w-4 h-4" /> Swap/Barter
                      </button>
                    )}
                    {product.available_for_preorder && (
                      <button onClick={() => navigate(`/pre-orders/${product.uuid}`)} className="w-full border-2 border-orange-100 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <Package className="w-4 h-4" /> Pre-Order
                      </button>
                    )}
                    {product.is_layaway && product.layaway_boxes > 0 && (
                      <button onClick={handleOpenLayawayModal} className="w-full border-2 border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <Clock className="w-4 h-4" /> Layaway / Susu
                      </button>
                    )}
                    <button onClick={() => navigate('/messages', { state: { initialSubject: `Inquiry: ${product.name}` } })} className="w-full border-2 border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                      <MessageSquare className="w-4 h-4" /> Support
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {/* PRODUCT DETAILS BLOCK */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-800">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white uppercase">Product Details</h2>
            </div>
            <div className="p-6 prose dark:prose-invert max-w-none text-secondary-700 dark:text-secondary-300 text-sm leading-relaxed">
              {product.description}
              {/* If we had marketing banners per product, they'd go here. Using a sample layout below */}
              {product.short_description && (
                <div className="mt-8 bg-secondary-50 dark:bg-secondary-800/30 p-6 rounded-xl border border-secondary-100 dark:border-secondary-800">
                  <h3 className="text-secondary-900 dark:text-white font-bold mb-3">Key Marketing Features</h3>
                  <p>{product.short_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* SPECIFICATIONS BLOCK */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-800">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white uppercase">Specifications</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-12">
              <div className="flex-1">
                <h3 className="font-bold text-secondary-900 dark:text-white mb-4 uppercase text-sm tracking-wide">Key Features</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-secondary-700 dark:text-secondary-300">
                  {product.available_for_trade && (
                    <li>Eligible for direct Barter/Swap</li>
                  )}
                  {product.available_for_hire_purchase && (
                    <li>Available for Pay-in-Installments (Hire Purchase)</li>
                  )}
                  {product.condition && <li className="capitalize">Condition: {product.condition.replace('_', ' ')}</li>}
                  {product.is_negotiable && <li>Price is negotiable upon contact</li>}
                  {(!product.available_for_trade && !product.available_for_hire_purchase && !product.condition && !product.is_negotiable) && (
                    <li>See technical specs below for details</li>
                  )}
                </ul>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-secondary-900 dark:text-white mb-4 uppercase text-sm tracking-wide">Technical Specs</h3>
                <div className="border border-secondary-200 dark:border-secondary-800 rounded-lg overflow-hidden text-sm">
                  <div className="grid grid-cols-2 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="p-3 font-semibold text-secondary-900 dark:text-white">SKU</div>
                    <div className="p-3 text-secondary-700 dark:text-secondary-300">{product.sku || 'N/A'}</div>
                  </div>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? Object.entries(product.specifications).map(([key, val], idx) => (
                    <div key={key} className={`grid grid-cols-2 ${idx !== Object.entries(product.specifications).length - 1 ? 'border-b border-secondary-200 dark:border-secondary-700' : ''}`}>
                      <div className="p-3 font-semibold text-secondary-900 dark:text-white capitalize">{key}</div>
                      <div className="p-3 text-secondary-700 dark:text-secondary-300">{val}</div>
                    </div>
                  )) : (
                    <div className="grid grid-cols-2 border-b border-secondary-200 dark:border-secondary-700">
                      <div className="p-3 font-semibold text-secondary-900 dark:text-white">Model</div>
                      <div className="p-3 text-secondary-700 dark:text-secondary-300">{product.name}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2">
                    <div className="p-3 font-semibold text-secondary-900 dark:text-white">Stock Weight/Size</div>
                    <div className="p-3 text-secondary-700 dark:text-secondary-300">Varies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER FEEDBACK BLOCK */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-800">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white uppercase">Verified Customer Feedback</h2>
            </div>
            <div className="p-6">
              {(!product.reviews || product.reviews.length === 0) ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-800 mb-4">
                    <ThumbsUp className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h3 className="font-bold text-secondary-900 dark:text-white">No Reviews Yet</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-1">Be the first to review this product after purchase!</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="w-full md:w-64 flex-shrink-0">
                    <h3 className="font-bold text-secondary-900 dark:text-white uppercase text-sm tracking-wide mb-4">Verification Score</h3>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-5xl font-extrabold text-secondary-900 dark:text-white">{parseFloat(product.average_rating).toFixed(1)}</span>
                      <span className="text-xl text-secondary-500">/ 5</span>
                    </div>
                    <div className="flex items-center text-amber-400 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= parseFloat(product.average_rating) ? 'fill-current' : 'text-secondary-300 dark:text-secondary-700'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{product.reviews_count} verified ratings</p>
                  </div>
                  <div className="flex-1 space-y-6">
                    {product.reviews.map(review => (
                      <div key={review.id} className="border-b border-secondary-200 dark:border-secondary-800 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'text-secondary-300 dark:text-secondary-700'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-secondary-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-secondary-900 dark:text-white">{review.title || 'Review'}</h4>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300 mt-1">{review.comment}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-secondary-500">by {review.user?.first_name || 'Anonymous'}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Purchase
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Sidebar (Right) */}
        <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 space-y-6 lg:sticky lg:top-24">
          <DeliveryInfoCard />
          <SellerInfoCard store={product.store} navigate={navigate} product={product} />
        </div>

      </div>

      {/* Layaway Registration Modal */}
      {layawayModalOpen && product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-secondary-200 dark:border-secondary-800">
            <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Layaway Plan Details
              </h3>
              <button onClick={() => setLayawayModalOpen(false)} className="text-secondary-400 hover:text-secondary-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm font-medium border border-blue-100 dark:border-blue-900/30">
                You are about to start a savings plan for <strong>{product.name}</strong>. Please review the terms set by the admin below.
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 pb-2">
                  <span className="text-secondary-500 dark:text-secondary-400 text-sm">Target Amount</span>
                  <span className="font-bold text-secondary-900 dark:text-white">GH₵ {currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 pb-2">
                  <span className="text-secondary-500 dark:text-secondary-400 text-sm">Total Boxes (Duration)</span>
                  <span className="font-bold text-secondary-900 dark:text-white">{product.layaway_boxes} Boxes</span>
                </div>
                <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 pb-2">
                  <span className="text-secondary-500 dark:text-secondary-400 text-sm">Payment Per Box</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">GH₵ {(currentPrice / product.layaway_boxes).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-secondary-100 dark:border-secondary-800">
                <h3 className="font-bold text-secondary-900 dark:text-white text-sm">Terms & Conditions</h3>
                <div className="p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-lg text-xs text-secondary-600 dark:text-secondary-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  1. All layaway plans are subject to the total amount and box counts specified by the admin.
                  2. Payments are non-refundable unless explicitly agreed upon.
                  3. The item will be reserved for you exclusively until the layaway is fully paid.
                  4. You may make payments at any time. Once all boxes are checked, the item will be shipped to you.
                  5. Failure to complete payments within an exceptionally long period may result in plan cancellation based on management discretion.
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${acceptedTerms ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-700'}`}>
                    {acceptedTerms && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
                  <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors">
                    I have read and accept the Layaway / Susu Terms and Conditions
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 bg-secondary-50 dark:bg-secondary-800/50 border-t border-secondary-100 dark:border-secondary-800 flex gap-3">
              <button onClick={() => setLayawayModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50 transition-colors">
                Cancel / Reject
              </button>
              <button onClick={handleLayawayRegistration} disabled={!acceptedTerms} className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors ${acceptedTerms ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-secondary-400 cursor-not-allowed'}`}>
                Confirm & Start
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
