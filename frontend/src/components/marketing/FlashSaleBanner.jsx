import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const formatCurrency = (amount) => {
  return `GHS ${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white dark:bg-secondary-800 text-red-600 dark:text-red-400 font-black text-lg sm:text-xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg shadow-sm">
      {value.toString().padStart(2, '0')}
    </div>
    <span className="text-[10px] sm:text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">{label}</span>
  </div>
);

const FlashSaleBanner = () => {
  const [flashSale, setFlashSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await apiClient.get('/marketing/flash-sales/active');
        const sales = response.data?.data || [];
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

  return (
    <section className="mb-12">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-t-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-12 -right-12 text-red-700/20 rotate-12">
           <Zap className="w-32 h-32" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white italic">{flashSale.title}</h2>
            <p className="text-red-100 text-sm font-medium">Limited quantities available at these prices</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-1.5 text-red-100 font-semibold text-sm mr-2 hidden lg:flex">
             <Clock className="w-4 h-4" /> Ends in:
          </div>
          <CountdownUnit value={timeLeft.hours} label="Hrs" />
          <span className="text-white font-black text-xl mb-4">:</span>
          <CountdownUnit value={timeLeft.minutes} label="Min" />
          <span className="text-white font-black text-xl mb-4">:</span>
          <CountdownUnit value={timeLeft.seconds} label="Sec" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white dark:bg-secondary-900 border border-t-0 border-secondary-200 dark:border-secondary-800 rounded-b-2xl p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashSale.products.map(product => {
            const discountPercentage = Math.round(((product.price - product.flash_price) / product.price) * 100);
            const soldPercentage = Math.round((product.stock_sold / product.stock_allocated) * 100);
            
            return (
              <Link key={product.id} to={`/products/${product.slug}`} className="group block relative border border-secondary-200 dark:border-secondary-800 rounded-xl p-3 sm:p-4 hover:shadow-xl hover:border-red-500/50 transition-all duration-300 bg-white dark:bg-secondary-900 overflow-hidden">
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
