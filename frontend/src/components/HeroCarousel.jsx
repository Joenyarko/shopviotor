import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adService } from '../services/adService';

const HeroCarousel = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const loadedAds = await adService.getAds();
        setAds(loadedAds);
      } catch (err) {
        console.error("Failed to load ads", err);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [ads]);

  if (ads.length === 0) {
    return (
      <div className="w-full h-48 md:h-80 bg-secondary-100 dark:bg-secondary-800 rounded-xl animate-pulse"></div>
    );
  }

  return (
    <div className="relative w-full h-48 md:h-[400px] rounded-xl overflow-hidden shadow-lg group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={ads[currentIndex].imageUrl} 
            alt={ads[currentIndex].title || "Marketing Ad"} 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dots Indicator */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary-500 w-5' : 'bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
