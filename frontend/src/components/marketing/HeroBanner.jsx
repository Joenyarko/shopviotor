import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bannerService from '../../services/bannerService';
import { motion, AnimatePresence } from 'framer-motion';

const HeroBanner = ({ position, fallbackContent }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await bannerService.getBanners({ position });
        const data = res.data || res || [];
        setBanners(data);
      } catch (error) {
        console.error('Failed to load banners for position:', position, error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [position]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-secondary-200 dark:bg-secondary-800 animate-pulse h-64 md:h-80 shadow-lg"></div>
    );
  }

  if (banners.length > 0) {
    const banner = banners[currentIndex];
    return (
      <div className="-mx-4 md:-mx-8 -mt-6 mb-8 relative overflow-hidden shadow-lg h-40 sm:h-48 md:h-[530px] group bg-secondary-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -50) {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
              } else if (swipe > 50) {
                setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <img 
              src={banner.image_url} 
              alt={banner.title || 'Advertisement'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Optional Overlay for Text if provided */}
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-center items-center text-center p-8 md:p-12">
                <div className="relative z-10 max-w-4xl space-y-4 mt-auto">
                  {banner.title && <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">{banner.title}</h1>}
                  {banner.subtitle && <p className="text-lg md:text-xl font-medium text-white/90">{banner.subtitle}</p>}
                </div>
              </div>
            )}
            {/* Clickable Overlay */}
            {banner.link && (
              <a href={banner.link} target={banner.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="absolute inset-0 z-20 z-[25]"></a>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-30">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-primary-500 w-4' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback to the original beautifully designed gradient block if no banner is uploaded yet
  return fallbackContent || null;
};

export default HeroBanner;
