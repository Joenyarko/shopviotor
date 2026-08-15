import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Privacy Policy</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">1. Information We Collect</h2>
          <p>
            When you register on Viotor, we collect personal information such as your name, email address, phone number, and physical address. For vendors and users requesting hire purchase, we also collect KYC (Know Your Customer) documents, such as valid government IDs and student ID cards, to verify identity and prevent fraud.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Facilitate trades, sales, and deliveries between users.</li>
            <li>Process payments securely via our payment gateways (e.g., Paystack).</li>
            <li>Verify vendor identities to ensure a secure marketplace.</li>
            <li>Resolve disputes and provide customer support.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">3. Data Sharing</h2>
          <p>
            We do not sell your personal data. We only share necessary information (like delivery addresses and phone numbers) with the vendor or courier strictly for the purpose of fulfilling your order. Payment details are encrypted and handled directly by our secure payment partners.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
export { Privacy };
