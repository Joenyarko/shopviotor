import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import hpService from '../../services/hpService';
import { Percent, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const HirePurchase = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const targetProduct = state?.targetProduct;

  const [deposit, setDeposit] = useState(0);
  const [duration, setDuration] = useState(6); // 6 months default
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Interest Rates Mock (e.g. 5% interest for 6 months, 10% for 12, etc.)
  const interestRate = duration <= 6 ? 5 : duration <= 12 ? 10 : 15;
  const productPrice = targetProduct ? parseFloat(targetProduct.price) : 0;
  const interestAmount = productPrice * (interestRate / 100);
  const totalFinanced = productPrice + interestAmount;
  
  // Calculate minimum deposit (e.g. 20% of price)
  const minDeposit = productPrice * 0.2;
  const balanceRemaining = Math.max(0, totalFinanced - deposit);
  const monthlyInstallment = duration > 0 ? balanceRemaining / duration : 0;

  useEffect(() => {
    if (targetProduct) {
      setDeposit(Math.round(minDeposit));
    }
  }, [targetProduct]);

  const handleSubmitAgreement = async (e) => {
    e.preventDefault();
    if (!targetProduct) return;
    if (deposit < minDeposit) {
      setErrorMsg(`Minimum deposit is GHS ${minDeposit.toFixed(2)} (20% of product value).`);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        product_id: targetProduct.id || targetProduct.uuid,
        deposit_amount: deposit,
        duration_months: duration,
        interest_rate: interestRate,
      };

      await hpService.createAgreement(payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to initialize hire purchase agreement.');
    } finally {
      setLoading(false);
    }
  };

  const [hpProducts, setHpProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!targetProduct) {
      const fetchHpProducts = async () => {
        setLoadingProducts(true);
        try {
          const res = await hpService.getProducts ? hpService.getProducts() : (await import('../../services/productService')).default.getProducts({ available_for_hire_purchase: true });
          setHpProducts(res.data?.data || res.data || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchHpProducts();
    }
  }, [targetProduct]);

  if (!targetProduct) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-8 md:p-12 shadow-lg">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold text-white">
              <Percent className="w-4 h-4" /> Flexible Financing
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Hire Purchase</h1>
            <p className="text-lg md:text-xl font-medium opacity-90">
              Get the items you need today. Pay a small deposit and spread the balance over flexible monthly installments.
            </p>
            <div className="pt-2">
              <Link to="/products?hire_purchase=true" className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                Browse All Products <RefreshCw className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 text-primary-500 animate-spin" /></div>
        ) : hpProducts.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl">
            <Percent className="w-16 h-16 text-secondary-300 dark:text-secondary-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">No products available for Hire Purchase</h2>
            <p className="text-secondary-500 dark:text-secondary-400 mb-6">Check back later for exciting new products.</p>
            <Link to="/products?hire_purchase=true" className="inline-block premium-button-primary px-6 rounded-lg text-sm py-2">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden shadow-sm mt-8">
            {hpProducts.map(product => {
              const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/300?text=No+Image';
              
              return (
                <div key={product.id} className="bg-white dark:bg-secondary-900 hover:shadow-lg transition-all group flex flex-col relative z-0 hover:z-10">
                  <div className="relative aspect-square overflow-hidden bg-secondary-100 dark:bg-secondary-850 p-4">
                    <img src={primaryImage} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal" />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                      HP
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow border-t border-secondary-100 dark:border-secondary-800/80">
                    <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-2 text-sm md:text-base leading-snug">{product.name}</h3>
                    <div className="mt-auto pt-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase font-bold text-secondary-500 dark:text-secondary-400">Cash Price</span>
                        <span className="font-bold text-lg text-secondary-900 dark:text-white leading-none">GHS {parseFloat(product.price).toLocaleString('en-US')}</span>
                      </div>
                      <Link to={`/products/${product.id}`} className="premium-button-primary w-full py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 mt-3 shadow-sm">
                        Configure Plan <RefreshCw className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Hire Purchase Installment Portal</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Configure your flexible financing parameters below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Configurator Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-secondary-100 dark:bg-secondary-900 p-4 border rounded-2xl flex gap-4 items-center">
            <img 
              src={targetProduct.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60'} 
              alt="" 
              className="w-16 h-16 object-cover rounded-lg bg-white"
            />
            <div>
              <span className="text-xxs font-bold text-primary-600 uppercase bg-primary-100 dark:bg-primary-950/20 px-2 py-0.5 rounded">Financing Item</span>
              <h3 className="font-semibold text-sm text-secondary-900 dark:text-white mt-1">{targetProduct.name}</h3>
              <span className="font-bold text-xs">Cash Price: GHS {productPrice.toLocaleString()}</span>
            </div>
          </div>

          {success ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4 transition-colors">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Agreement Initialized!</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                Your Hire Purchase plan is set up. You can pay your deposit and start taking deliveries under the dashboard.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/dashboard" className="premium-button-primary px-6 rounded-lg text-sm">Go to Dashboard</Link>
                <Link to="/products" className="premium-button-secondary px-6 rounded-lg text-sm">Return Catalog</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitAgreement} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6 transition-colors">
              
              {errorMsg && (
                <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Deposit slider */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  Down Payment Deposit (GHS)
                </label>
                <div className="mt-2.5 flex items-center gap-4">
                  <input
                    type="range"
                    min={minDeposit}
                    max={productPrice}
                    value={deposit}
                    onChange={(e) => setDeposit(parseInt(e.target.value))}
                    className="flex-grow h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 p-2 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm font-bold text-center"
                  />
                </div>
                <span className="text-xxs text-secondary-500 dark:text-secondary-400 block mt-2">Minimum required: GHS {minDeposit.toFixed(2)} (20%)</span>
              </div>

              {/* Installment Term selection */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  Installment Period (Months)
                </label>
                <div className="grid grid-cols-4 gap-3 mt-2.5">
                  {[3, 6, 12, 18].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDuration(m)}
                      className={`py-3 border rounded-xl font-semibold text-sm transition-all ${duration === m ? 'border-primary-500 bg-primary-50/10 text-primary-600 font-bold' : 'border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:text-secondary-200'}`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Create HP Agreement'}
              </button>

            </form>
          )}

        </div>

        {/* Right Column: Dynamic Price breakdown card */}
        <div>
          <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors sticky top-24">
            <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Installment Calculator</h2>
            <div className="space-y-4 text-sm pb-4 border-b border-secondary-100 dark:border-secondary-800">
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Principal Price</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Interest Cost ({interestRate}%)</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {interestAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Total Obligation</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {totalFinanced.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Down Payment</span>
                <span className="font-semibold text-emerald-600">- GHS {deposit.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 text-center">
              <span className="block text-xs text-secondary-500 dark:text-secondary-400 uppercase font-bold tracking-wider mb-1">Monthly Payment</span>
              <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                GHS {monthlyInstallment.toFixed(2)} <span className="text-xs font-normal text-secondary-500 dark:text-secondary-400">/mo</span>
              </span>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default HirePurchase;
export { HirePurchase };
