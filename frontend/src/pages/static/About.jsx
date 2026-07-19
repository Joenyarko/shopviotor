import React from 'react';

const About = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">About Viotor Marketplace</h1>
      <p className="text-secondary-600 dark:text-secondary-400">
        Viotor is an enterprise-scale online classifieds and marketplace application designed specifically for direct-to-consumer trades and specialized services in Ghana. 
      </p>
      <p className="text-secondary-600 dark:text-secondary-400">
        By offering direct buy, barter swaps, raffles, layaway, and structured hire purchases under one unified portal, we make trading accessible for everyone.
      </p>
    </div>
  );
};

export default About;
export { About };
