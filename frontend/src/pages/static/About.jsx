import React from 'react';

import { ShoppingBag, ArrowRightLeft, CreditCard, Banknote, Ticket, ShieldCheck } from 'lucide-react';

const About = () => {
  const services = [
    { icon: ShoppingBag, title: 'Direct Sales', desc: 'A traditional e-commerce marketplace where verified vendors can list new or pre-owned goods for direct purchase.' },
    { icon: ArrowRightLeft, title: 'Barter Swaps', desc: 'Users can list items they wish to trade and negotiate swaps directly with other users via our built-in chat system.' },
    { icon: CreditCard, title: 'Layaway Plans', desc: 'Allowing buyers to reserve items and pay in small, manageable installments over time before taking delivery.' },
    { icon: Banknote, title: 'Hire Purchase', desc: 'Enabling customers to acquire goods immediately while paying the balance in structured installments (subject to KYC).' },
    { icon: Ticket, title: 'Raffles', desc: 'Exciting community events where users can purchase tickets for a chance to win high-value items.' },
  ];

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-secondary-950 to-secondary-900 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="text-primary-500 font-bold tracking-widest text-sm uppercase">Pawn 2 King Enterprise</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Redefining <span className="text-primary-400">Commerce</span> in Ghana
          </h1>
          <p className="text-secondary-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Shop Viotor is an enterprise-scale online classifieds and marketplace application designed specifically for direct-to-consumer trades and specialized services.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Our Core Services</h2>
          <p className="text-secondary-500 dark:text-secondary-400">Comprehensive solutions for every type of trade.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <div key={i} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 hover:shadow-xl hover:border-primary-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                <svc.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">{svc.title}</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Operations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-4 flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">How We Operate Safely</h2>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed max-w-3xl">
              Shop Viotor serves as a trusted intermediary. We process payments securely via our payment partners and hold funds in escrow until goods are delivered or services are rendered. This protects both the buyer and the vendor, ensuring a consistently safe trading environment for all Ghanaians.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
export { About };
