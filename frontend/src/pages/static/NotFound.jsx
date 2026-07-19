import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex flex-col justify-center items-center px-4 transition-colors">
      <div className="max-w-md text-center space-y-6">
        <HelpCircle className="w-20 h-20 text-primary-500 mx-auto animate-bounce" />
        <h1 className="text-6xl font-extrabold text-secondary-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-bold text-secondary-800 dark:text-secondary-200">Page Not Found</h2>
        <p className="text-secondary-500 text-sm">
          Sorry, the page you are looking for doesn't exist or has been relocated.
        </p>
        <Link to="/" className="inline-block premium-button-primary px-6 py-3 rounded-full font-semibold shadow-md active:scale-95">
          Return to Storefront
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
export { NotFound };
