import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">About Viotor Marketplace</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Pawn 2 King Enterprise</p>
      </div>
      
      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <p className="text-lg leading-relaxed">
          Operated by <strong>Pawn 2 King Enterprise</strong>, Viotor is an enterprise-scale online classifieds and marketplace application designed specifically for direct-to-consumer trades and specialized services in Ghana. 
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Our Core Services</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Direct Sales:</strong> A traditional e-commerce marketplace where verified vendors can list new or pre-owned goods for direct purchase.</li>
            <li><strong>Barter Swaps:</strong> Users can list items they wish to trade and negotiate swaps directly with other users via our built-in chat system.</li>
            <li><strong>Layaway Plans:</strong> Allowing buyers to reserve items and pay in small, manageable installments over time before taking delivery.</li>
            <li><strong>Hire Purchase:</strong> Enabling customers to acquire goods immediately while paying the balance in structured installments (subject to strict KYC and credit verification).</li>
            <li><strong>Raffles:</strong> Exciting community events where users can purchase tickets for a chance to win high-value items.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">How We Operate</h2>
          <p>
            Viotor serves as a trusted intermediary. We process payments securely via our payment partners and hold funds in escrow until goods are delivered or services are rendered. This protects both the buyer and the vendor, ensuring a safe trading environment.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
export { About };
