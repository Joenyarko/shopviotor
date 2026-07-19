import React from 'react';
import { Phone } from 'lucide-react';

const TopBanner = () => {
  return (
    <div className="bg-primary-500 text-secondary-900 px-4 py-2 flex items-center justify-center sm:justify-start w-full">
      <div className="max-w-7xl mx-auto w-full flex items-center font-bold text-sm tracking-wide">
        <Phone className="w-4 h-4 mr-2" />
        <span>CALL TO ORDER: 030 274 0642</span>
      </div>
    </div>
  );
};

export default TopBanner;
