import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { Package, ArrowRight, Clock, Lock, CheckCircle2, TrendingUp, CreditCard, Search } from 'lucide-react';
import layawayService from '../../services/layawayService';
import DotPagination from '../../components/DotPagination';

import HeroBanner from '../../components/marketing/HeroBanner';

const Layaway = () => {
  const [products, setProducts] = useState([]);
  const [cards, setCards] = useState([]);
  const [cardsMeta, setCardsMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardSearch, setCardSearch] = useState('');
  const [cardPage, setCardPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLayawayProducts();
  }, []);

  useEffect(() => {
    fetchLayawayCards();
  }, [cardPage]);

  const fetchLayawayProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ available_for_layaway: 1, per_page: 24 });
      setProducts(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLayawayCards = async () => {
    try {
      setLoadingCards(true);
      const res = await layawayService.getCards({ page: cardPage, search: cardSearch, per_page: 8 });
      setCards(res.data?.data || res.data || []);
      setCardsMeta(res.data?.meta || res.meta || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCardSearch = (e) => {
    e.preventDefault();
    if (cardPage !== 1) {
      setCardPage(1);
    } else {
      fetchLayawayCards();
    }
  };

  const handleStartLayaway = (product) => {
    navigate('/layaway/start', { state: { product } });
  };

  const handleStartLayawayFromCard = (card) => {
    navigate('/layaway/start', { state: { plan_card: card } });
  };

  const fallbackHero = (
    <div className="-mx-4 md:-mx-8 -mt-6 mb-8 relative bg-gradient-to-br from-secondary-950 via-[#0a1628] to-secondary-900 px-6 py-16 md:py-24 overflow-hidden">
      {/* decorative orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" /> Save Now, Receive Later
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
          Layaway — The <span className="text-primary-400">Smart</span><br /> Way to Own Products
        </h1>
        <p className="text-secondary-400 text-base md:text-lg max-w-xl mx-auto">
          Just like a daily susu — make small, consistent payments toward a product. Once fully paid, we deliver it straight to your door!
        </p>

        <div className="flex flex-wrap justify-center gap-6 pt-6">
          {[
            { icon: Lock, label: 'Item Reserved for You' },
            { icon: Clock, label: 'Pay at Your Own Pace' },
            { icon: CheckCircle2, label: 'Delivered When Paid' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-semibold text-primary-400">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Header */}
      <HeroBanner position="layaway_hero" fallbackContent={fallbackHero} />

      {/* How it Works */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: '01', title: 'Pick a Product', desc: 'Browse items available for layaway and select what you want.' },
          { step: '02', title: 'Start Your Plan', desc: 'Make your first payment contribution — any amount you can afford.' },
          { step: '03', title: 'Contribute Regularly', desc: 'Keep adding to your balance like a susu pot until it\'s fully paid.' },
          { step: '04', title: 'Receive Your Item', desc: 'Once 100% is paid, we process and deliver your product immediately.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <span className="text-3xl font-black text-primary-500/30">{step}</span>
            <h3 className="font-bold text-secondary-900 dark:text-white">{title}</h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Layaway Plan Cards */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary-500" />
            Layaway Plan Cards
          </h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={handleCardSearch} className="relative flex-1 md:w-72">
              <input
                type="text"
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                placeholder="Search plans..."
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white"
              />
              <Search className="w-5 h-5 text-secondary-400 absolute left-3 top-2.5" />
            </form>
            <Link to="/my-layaways" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 hidden lg:flex whitespace-nowrap">
              My Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loadingCards ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary-200 dark:bg-secondary-800 aspect-[4/3] rounded-2xl mb-4" />
                <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-2/3 mb-2" />
                <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map(card => (
              <div key={card.uuid} className="group flex flex-col bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/3] relative bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CreditCard className="w-12 h-12 text-secondary-300 dark:text-secondary-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-secondary-900/90 backdrop-blur px-2.5 py-1 rounded-full border border-secondary-200 dark:border-secondary-700">
                    <p className="text-xs font-bold text-secondary-900 dark:text-white whitespace-nowrap">
                      GHS {Number(card.number_of_boxes * card.price_per_box).toFixed(2)} Total
                    </p>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-secondary-900 dark:text-white text-lg mb-1">{card.name}</h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 line-clamp-2 mb-4 h-8">{card.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                    <div className="bg-secondary-50 dark:bg-secondary-800/50 p-2 rounded-lg">
                      <p className="text-xxs text-secondary-500 dark:text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Steps</p>
                      <p className="font-bold text-secondary-900 dark:text-white">{card.number_of_boxes}</p>
                    </div>
                    <div className="bg-secondary-50 dark:bg-secondary-800/50 p-2 rounded-lg">
                      <p className="text-xxs text-secondary-500 dark:text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Price/Step</p>
                      <p className="font-bold text-primary-600 dark:text-primary-400">GHS {Number(card.price_per_box).toFixed(2)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartLayawayFromCard(card)}
                    className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    Start This Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loadingCards && cards.length > 0 && (
          <DotPagination
            currentPage={cardPage}
            totalPages={cardsMeta?.last_page || 1}
            onPageChange={setCardPage}
          />
        )}
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" />
            Products Available for Layaway
          </h2>
          <Link to="/my-layaways" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            My Plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-secondary-100 dark:bg-secondary-800 rounded-2xl h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800">
            <Package className="w-16 h-16 text-secondary-300" />
            <p className="text-secondary-500 dark:text-secondary-400 font-semibold">No products are currently available for layaway.</p>
            <p className="text-sm text-secondary-400">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                  <img
                    src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    LAYAWAY
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm text-secondary-900 dark:text-white line-clamp-2 mb-1">{product.name}</h3>
                  {product.layaway_box_price && product.layaway_total_boxes ? (
                    <div className="mb-3">
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-base">GHS {parseFloat(product.layaway_box_price).toLocaleString()} <span className="text-xs text-secondary-500 font-semibold uppercase tracking-wider">/ box</span></p>
                      <p className="text-xs text-secondary-500 font-semibold">{product.layaway_total_boxes} boxes total</p>
                    </div>
                  ) : (
                    <p className="text-primary-600 dark:text-primary-400 font-bold text-base mb-3">GHS {parseFloat(product.price).toLocaleString()}</p>
                  )}
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-4 flex-1">
                    Start paying in contributions. Receive when fully paid!
                  </p>
                  <button
                    onClick={() => handleStartLayaway(product)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                  >
                    Register / Purchase Layaway
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Layaway;
export { Layaway };
