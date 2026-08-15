import React from 'react';

const AcceptableUse = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Acceptable Use Policy</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">1. Vendor Conduct</h2>
          <p>
            Shop Viotor is committed to providing a safe and reliable marketplace. All vendors must adhere to the following rules:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Prohibited Items:</strong> You may not sell illegal goods, weapons, stolen property, counterfeits, or hazardous materials.</li>
            <li><strong>Accurate Descriptions:</strong> All product listings, especially for barter and secondhand items, must accurately describe the condition of the item. Any flaws or defects must be explicitly stated.</li>
            <li><strong>KYC Verification:</strong> Vendors may be subject to Know Your Customer (KYC) identity verification by submitting valid government ID documents before withdrawing funds from their Shop Viotor balance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">2. Buyer Conduct</h2>
          <p>
            Buyers are expected to interact respectfully with vendors and follow through with their commitments:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Layaway & Hire Purchase:</strong> By starting a layaway or hire purchase plan, you agree to make the required installments. Repeated failure to pay installments may lead to account suspension.</li>
            <li><strong>Barter Integrity:</strong> When engaging in a barter swap, you must accurately represent the item you are trading. Scamming or sending empty boxes will result in an immediate and permanent ban, and potential legal action.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">3. Wallet & Fund Management</h2>
          <p>
            Shop Viotor operates an internal ledger (balance) system for vendors to track their earnings from successful sales.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Funds in a vendor's balance are strictly the proceeds of their sales minus Shop Viotor's commission fees.</li>
            <li>Vendors cannot deposit external funds directly into this balance.</li>
            <li><strong>No Peer-to-Peer Transfers:</strong> Users and vendors cannot transfer funds from their Shop Viotor balance to another user's balance. The balance can only be withdrawn to the vendor's verified bank account or mobile money wallet.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AcceptableUse;
export { AcceptableUse };
