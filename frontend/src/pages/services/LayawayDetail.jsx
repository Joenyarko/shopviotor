import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import layawayService from '../../services/layawayService';
import { Lock, AlertCircle, RefreshCw, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

const LayawayDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state?.product;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdLayaway, setCreatedLayaway] = useState(null);

  const [terms, setTerms] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [apiClient, setApiClient] = useState(null);

  React.useEffect(() => {
    import('../../api/client').then(module => {
      setApiClient(() => module.default);
      module.default.get('/layaways/settings/terms')
        .then(res => setTerms(res.data?.data?.layaway_terms || ''))
        .catch(console.error);
    });
  }, []);

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 dark:text-white space-y-4">
        <Lock className="w-16 h-16 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold">No Product Selected</h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">Please browse our layaway products and select one.</p>
        <Link to="/layaway" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold">
          Browse Layaway Products
        </Link>
      </div>
    );
  }

  const productPrice = parseFloat(product.price);
  const boxes = product.layaway_boxes || product.layaway_total_boxes || 1;
  const boxPrice = productPrice / boxes;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('You must accept the terms and conditions.');
      return;
    }
    if (!apiClient) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.post('/layaways', {
        product_uuid: product.uuid,
      });
      setCreatedLayaway(res.data?.data);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to start layaway plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link to="/layaway" className="text-sm text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center gap-1">
          ← Back to Layaway Hub
        </Link>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white mt-2">Start Layaway Plan</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Reserve this item and pay at your own pace. Delivery happens when fully paid.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product Card */}
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex gap-4 items-center">
            <img
              src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xl bg-secondary-100"
            />
            <div className="flex-1">
              <span className="text-xxs font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded uppercase tracking-wide">Item to Reserve</span>
              <h3 className="font-bold text-secondary-900 dark:text-white mt-1">{product.name}</h3>
              <p className="text-primary-600 dark:text-primary-400 font-black text-lg">GHS {productPrice.toLocaleString()}</p>
            </div>
          </div>

          {product.layaway_total_boxes && (
            <div className="bg-accent-50 dark:bg-accent-950/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-accent-700 dark:text-accent-400 uppercase tracking-wider">Susu Plan / Box Pricing</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="font-black text-secondary-900 dark:text-white text-3xl">GHS {product.layaway_box_price?.toLocaleString()}</p>
                  <p className="text-secondary-500 font-bold">per box</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-secondary-500 text-sm font-bold">Total Boxes</p>
                <p className="font-black text-secondary-900 dark:text-white text-2xl">{boxes}</p>
              </div>
            </div>
          )}

          {success ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Layaway Plan Started!</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                Your item is now reserved. Keep contributing until fully paid, then we'll deliver it to you!
              </p>
              {createdLayaway && (
                <div className="bg-primary-50 dark:bg-primary-950/20 rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Boxes Left</span>
                    <span className="font-bold text-primary-600">{boxes} Boxes</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-center pt-2">
                <Link to="/my-layaways" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold">My Plans</Link>
                <Link to="/layaway" className="premium-button-secondary px-6 py-2.5 rounded-lg text-sm font-bold">Browse More</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className="font-bold text-lg text-secondary-900 dark:text-white">Configure Your Plan</h2>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex gap-2.5 text-sm border border-red-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Plan Details Preview */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 pb-2">
                  <span className="text-secondary-500 dark:text-secondary-400 text-sm">Target Amount</span>
                  <span className="font-bold text-secondary-900 dark:text-white">GH₵ {productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 pb-2">
                  <span className="text-secondary-500 dark:text-secondary-400 text-sm">Total Boxes (Duration)</span>
                  <span className="font-bold text-secondary-900 dark:text-white">{boxes} Boxes</span>
                </div>
                <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 pb-2">
                  <span className="text-secondary-500 dark:text-secondary-400 text-sm">Payment Per Box</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">GH₵ {boxPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Terms and Conditions */}
              {terms && (
                <div className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
                  <h3 className="font-bold text-secondary-900 dark:text-white">Terms & Conditions</h3>
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm text-secondary-600 dark:text-secondary-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {terms}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${acceptedTerms ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-700'}`}>
                      {acceptedTerms && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
                    <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 group-hover:text-secondary-900 dark:group-hover:text-white transition-colors">
                      I have read and accept the Layaway / Susu Terms and Conditions
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transition-colors"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Register / Purchase Layaway'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-6 text-white space-y-6 sticky top-24">
            <h3 className="font-bold text-lg">💡 How Layaway Works</h3>
            <div className="space-y-4">
              {[
                { emoji: '🔒', title: 'Item Reserved', desc: 'The moment you start a plan, this item is reserved exclusively for you.' },
                { emoji: '💰', title: 'Pay Bit by Bit', desc: 'Contribute any amount, any time — like putting money in a susu pot daily or weekly.' },
                { emoji: '📦', title: 'Delivered When Paid', desc: 'Once your balance hits GHS 0, we ship the item directly to you.' },
                { emoji: '🚫', title: 'No Extra Charges', desc: 'No interest. No hidden fees. You only pay the product price.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{title}</p>
                    <p className="text-primary-100 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayawayDetail;
export { LayawayDetail };
