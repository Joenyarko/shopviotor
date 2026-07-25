import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const formatCurrency = (amount) => {
  return `GHS ${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const CountdownUnit = ({ value, label, isBlack }) => (
  <div className="flex flex-col items-center">
    <div className={`font-black text-sm sm:text-base w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-sm ${isBlack ? 'bg-white text-secondary-900' : 'bg-white text-primary-600'}`}>
      {value.toString().padStart(2, '0')}
    </div>
    <span className={`text-[9px] mt-0.5 uppercase tracking-wider font-semibold ${isBlack ? 'text-secondary-300' : 'text-primary-900/80'}`}>{label}</span>
  </div>
);

const FlashSaleBanner = () => {
  const [flashSale, setFlashSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await apiClient.get('/marketing/flash-sales/active');
        const sales = response?.data?.data || response?.data || (Array.isArray(response) ? response : []);
        if (sales.length > 0) {
          setFlashSale(sales[0]); // Take the first active flash sale
        }
      } catch (error) {
        console.error('Failed to fetch flash sales:', error);
      }
    };
    fetchFlashSales();
  }, []);

  useEffect(() => {
    if (!flashSale || !flashSale.end_time) return;

    const calculateTimeLeft = () => {
      const difference = new Date(flashSale.end_time) - new Date();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60))),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [flashSale]);

  if (!flashSale || !flashSale.products || flashSale.products.length === 0) return null;

  const isBlack = true; // User requested flash sale title background to be black
  const headerBgClass = 'bg-secondary-900';
  const textColorClass = 'text-white';
  const subTextColorClass = 'text-secondary-300';

  return (
    <section className="mb-12 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800">
      {/* Header Bar */}
      <div className={`${headerBgClass} py-1 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative`}>
        <div className="flex items-center gap-3 relative z-10">
          <div>
            <h2 className={`text-sm sm:text-base font-bold ${textColorClass}`}>{flashSale.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${textColorClass} font-semibold text-xs hidden lg:flex mr-1`}>
               <Clock className="w-3.5 h-3.5" /> Ends in:
            </div>
            <CountdownUnit value={timeLeft.hours} label="Hrs" isBlack={isBlack} />
            <span className={`${textColorClass} font-black text-base mb-2.5`}>:</span>
            <CountdownUnit value={timeLeft.minutes} label="Min" isBlack={isBlack} />
            <span className={`${textColorClass} font-black text-base mb-2.5`}>:</span>
            <CountdownUnit value={timeLeft.seconds} label="Sec" isBlack={isBlack} />
          </div>
          <Link to="/products?flash_sale=true" className={`text-sm font-semibold hover:underline flex items-center gap-1 ${textColorClass}`}>
            See All &gt;
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white dark:bg-secondary-900 p-0">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-4 lg:grid-cols-6 divide-x md:divide-y-0 divide-secondary-200 dark:divide-secondary-800 border-t border-secondary-200 dark:border-secondary-800">
          {flashSale.products.map(product => {
            const discountPercentage = Math.round(((product.price - product.flash_price) / product.price) * 100);
            const soldPercentage = Math.round((product.stock_sold / product.stock_allocated) * 100);
            
            return (
              <Link key={product.id} to={`/products/${product.slug}`} className="group block relative p-4 hover:shadow-xl transition-all duration-300 bg-white dark:bg-secondary-900 overflow-hidden min-w-[150px] w-[45%] flex-none snap-start md:w-auto md:min-w-0">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  -{discountPercentage}%
                </div>

                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-secondary-50 dark:bg-secondary-800 relative">
                  {product.primary_image ? (
                    <img 
                      src={product.primary_image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-400">
                      No image
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-secondary-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex flex-col mb-3">
                  <span className="text-lg font-black text-red-600 dark:text-red-500">
                    {formatCurrency(product.flash_price)}
                  </span>
                  <span className="text-xs text-secondary-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {/* Scarcity Bar */}
                <div className="space-y-1.5 mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    <span>{product.stock_sold} Sold</span>
                    <span>{product.stock_allocated - product.stock_sold} Left</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
