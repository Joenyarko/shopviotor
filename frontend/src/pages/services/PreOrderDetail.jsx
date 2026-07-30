import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import preorderService from '../../services/preorderService';
import { Package, RefreshCw, AlertCircle, ArrowLeft, Truck, MapPin, RotateCcw, ShieldCheck, Store as StoreIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DeliveryInfoCard = () => (
  <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden mt-6">
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
    </div>
  </div>
);

const SellerInfoCard = ({ store, navigate }) => {
  if (!store) {
    return (
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-5 flex flex-col items-center justify-center text-center mt-6">
        <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-3">
          <StoreIcon className="w-6 h-6 text-secondary-400" />
        </div>
        <h4 className="font-bold text-sm text-secondary-900 dark:text-white">Viotor Official</h4>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 mb-4">Direct from Viotor platform</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden mt-6">
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
        <button 
          type="button"
          onClick={() => store.slug ? navigate(`/store/${store.slug}`) : null}
          className="w-full py-2 border border-secondary-300 dark:border-secondary-700 rounded-xl text-sm font-semibold text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
        >
          Visit Store
        </button>
      </div>
    </div>
  );
};

const PreOrderDetail = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProduct(uuid);
        setProduct(res.data?.data || res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [uuid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await preorderService.storePreOrder({
        product_id: product.id,
        customer_details: { name, phone, address }
      });
      Swal.fire({ text: String('Pre-order reserved successfully! You will be redirected to your dashboard.') });
      navigate('/my-pre-orders');
    } catch (e) {
      Swal.fire({ text: String(e.response?.data?.message || 'Failed to process pre-order.') });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!product || !product.available_for_preorder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Product not available for pre-order</h2>
        <button onClick={() => navigate('/pre-orders')} className="mt-4 text-primary-500 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Pre-Orders
        </button>
      </div>
    );
  }

  const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/300?text=No+Image';
  const depositAmount = product.preorder_deposit_amount || (product.price * 0.2).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate(-1)} className="text-secondary-500 hover:text-secondary-900 dark:hover:text-white flex items-center gap-2 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        
        {/* Product Summary */}
        <div className="w-full md:w-5/12 bg-secondary-50 dark:bg-secondary-800/50 p-6 md:p-8 flex flex-col border-r border-secondary-200 dark:border-secondary-800">
          <div className="aspect-square bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden p-4 shadow-sm mb-6">
            <img src={primaryImage} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white leading-tight mb-2">{product.name}</h2>
          <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-secondary-200 dark:border-secondary-800">
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-500 dark:text-secondary-400">Total Price</span>
              <span className="font-bold text-secondary-900 dark:text-white">GHS {product.price}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-500 dark:text-secondary-400">Expected Arrival</span>
              <span className="font-bold text-secondary-900 dark:text-white">
                {product.preorder_expected_date ? new Date(product.preorder_expected_date).toLocaleDateString() : 'TBD'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl mt-2">
              <span className="font-bold text-primary-700 dark:text-primary-400">Required Deposit</span>
              <span className="text-xl font-extrabold text-primary-700 dark:text-primary-400">GHS {depositAmount}</span>
            </div>
            </div>
            
            {/* Product Details Section */}
            <div className="mt-6 p-4 border border-secondary-200 dark:border-secondary-800 rounded-xl bg-white dark:bg-secondary-900">
               <h4 className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wide border-b border-secondary-200 dark:border-secondary-800 pb-2 mb-3">Product Details</h4>
               <p className="text-sm text-secondary-600 dark:text-secondary-300 line-clamp-3">
                 {product.short_description || product.description || 'No description available.'}
               </p>
            </div>
            
          </div>

        {/* Form */}
        <div className="w-full md:w-7/12 p-6 md:p-8">
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Reserve Your Pre-Order</h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-8">
            Please confirm your details. By placing a pre-order, you agree to pay the required deposit to secure your item. The remaining balance will be due upon arrival.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5">Full Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5">Phone Number</label>
              <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5">Delivery Address</label>
              <textarea required rows={3} value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            
            <button disabled={processing} type="submit" className="w-full premium-button-primary py-4 rounded-xl font-bold text-lg mt-4 disabled:opacity-50">
              {processing ? 'Processing...' : `Pay Deposit (GHS ${depositAmount})`}
            </button>
          </form>

          {/* Additional Info Cards */}
          <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-800">
            <h4 className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wide mb-4">Vendor Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SellerInfoCard store={product.store} navigate={navigate} />
              <DeliveryInfoCard />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PreOrderDetail;
