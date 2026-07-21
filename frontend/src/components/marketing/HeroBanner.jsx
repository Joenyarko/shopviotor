import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bannerService from '../../services/bannerService';

const HeroBanner = ({ position, fallbackContent }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        const res = await bannerService.getBanners({ position });
        if (res.data?.data?.length > 0) {
          // Select the first active banner for this position
          setBanner(res.data.data[0]);
        }
      } catch (error) {
        console.error('Failed to load banner for position:', position, error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [position]);

  if (loading) {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-secondary-200 dark:bg-secondary-800 animate-pulse h-64 md:h-80 shadow-lg"></div>
    );
  }

  if (banner && banner.image_url) {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 md:h-96 group">
        <img 
          src={banner.image_url} 
          alt={banner.title || 'Advertisement'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Optional Overlay for Text if provided */}
        {(banner.title || banner.subtitle) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="relative z-10 max-w-2xl space-y-2">
              {banner.title && <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{banner.title}</h1>}
              {banner.subtitle && <p className="text-lg md:text-xl font-medium text-white/90">{banner.subtitle}</p>}
            </div>
          </div>
        )}
        {/* Clickable Overlay */}
        {banner.link && (
          <a href={banner.link} target={banner.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="absolute inset-0 z-20"></a>
        )}
      </div>
    );
  }

  // Fallback to the original beautifully designed gradient block if no banner is uploaded yet
  return fallbackContent || null;
};

export default HeroBanner;
