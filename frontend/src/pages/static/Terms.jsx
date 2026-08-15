import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Terms of Service</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <p>
          Welcome to Shop Viotor, operated by Pawn 2 King Enterprise. By accessing or using our website, you agree to be bound by these Terms of Service.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">1. Account Registration</h2>
          <p>You must provide accurate information when registering. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">2. Marketplace Rules</h2>
          <p>
            Viotor provides a platform for users to buy, sell, and barter goods. We are not the seller of items listed by third-party vendors. However, we hold funds in escrow to ensure successful completion of transactions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">3. Payments and Escrow</h2>
          <p>
            All payments are processed securely. When you pay for an item, the funds are held by Viotor. Only after delivery is confirmed or the dispute period (48 hours) expires without issue do we release the funds to the vendor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">4. Layaway & Hire Purchase</h2>
          <p>
            By entering into a layaway or hire purchase agreement, you commit to making the agreed-upon installments. Defaulting on payments may result in cancellation and partial forfeiture of paid amounts as administrative fees.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
export { Terms };
