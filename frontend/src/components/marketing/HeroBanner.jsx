import React, { useState, useEffect, useRef } from 'react';
import bannerService from '../../services/bannerService';

const HeroBanner = ({ position, fallbackContent }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

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
        setCurrentIndex((prev) => {
          const next = (prev + 1) % banners.length;
          if (carouselRef.current) {
            const itemWidth = carouselRef.current.scrollWidth / banners.length;
            carouselRef.current.scrollTo({ left: next * itemWidth, behavior: 'smooth' });
          }
          return next;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const handleScroll = (e) => {
    if (!banners.length) return;
    const itemWidth = e.target.scrollWidth / banners.length;
    const index = Math.round(e.target.scrollLeft / itemWidth);
    if (index !== currentIndex && index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-secondary-200 dark:bg-secondary-800 animate-pulse h-44 sm:h-56 md:h-80 shadow-lg mx-4"></div>
    );
  }

  if (banners.length > 0) {
    return (
      <div className="w-full py-2">
        <div className="relative w-full h-36 sm:h-48 md:h-[420px] overflow-hidden">
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory space-x-1.5 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {banners.map((banner, idx) => (
              <div 
                key={banner.id || idx} 
                className="relative w-[90%] sm:w-[88%] md:w-[85%] flex-shrink-0 snap-center h-full rounded-xl overflow-hidden shadow-sm group bg-secondary-900"
              >
                <img 
                  src={banner.image_url} 
                  alt={banner.title || 'Advertisement'} 
                  className="w-full h-full object-fill sm:object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-center items-center text-center p-6 md:p-12">
                    <div className="relative z-10 max-w-4xl space-y-2 mt-auto">
                      {banner.title && <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">{banner.title}</h1>}
                      {banner.subtitle && <p className="text-sm md:text-lg font-medium text-white/90">{banner.subtitle}</p>}
                    </div>
                  </div>
                )}
                
                {banner.link && (
                  <a 
                    href={banner.link} 
                    target={banner.link.startsWith('http') ? '_blank' : '_self'} 
                    rel="noreferrer" 
                    className="absolute inset-0 z-20"
                  ></a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators Below Images */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3 pb-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  if (carouselRef.current) {
                    const itemWidth = carouselRef.current.scrollWidth / banners.length;
                    carouselRef.current.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
                  }
                }}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx 
                    ? 'w-6 h-2 bg-primary-500' 
                    : 'w-2 h-2 bg-secondary-300 dark:bg-secondary-700 hover:bg-secondary-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return fallbackContent || null;
};

export default HeroBanner;
