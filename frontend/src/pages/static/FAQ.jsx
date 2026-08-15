import React from 'react';

const FAQ = () => {
  const faqs = [
    { q: 'How does Barter swap work?', a: 'You submit a swap request on a product by uploading details and pictures of items you are offering to trade. The administrator values your items and gives you a cash difference quote to pay.' },
    { q: 'What is Hire Purchase?', a: 'Hire Purchase allows you to pay a deposit on a product and take delivery, then pay off the balance in monthly installments.' },
    { q: 'How do I claim a Raffle prize?', a: 'Once a raffle ends and a winner is picked, you will receive an email and system notification with a code. Use that code to claim your prize.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6">
            <h3 className="font-bold text-secondary-900 dark:text-white text-base">{faq.q}</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mt-2 text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            How do you verify vendors on the platform?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            Before a vendor can withdraw funds from their sales, they must complete our KYC (Know Your Customer) process. This involves submitting valid government-issued ID documents. Our admin team manually reviews and approves these documents to ensure the safety of our buyers.
          </p>
        </details>

        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            Do you receive payments on behalf of vendors?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            Yes. To protect both buyers and sellers, Shop Viotor receives all payments and holds them in secure escrow. Funds are only released to the vendor's internal balance after the buyer has received the item and the 48-hour dispute window has closed without issue.
          </p>
        </details>

        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            Can users transfer money to each other on Shop Viotor?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            No. Vendors have an internal ledger that tracks their earnings, but this is not a peer-to-peer wallet. Funds cannot be transferred between users. The balance can only be withdrawn directly to the vendor's verified bank or mobile money account.
          </p>
        </details>
        
        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            How are disputes and refunds handled?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            If an item arrives damaged or not as described, the buyer can open a dispute within 48 hours of delivery. Shop Viotor mediates the dispute. If the vendor is at fault, the buyer returns the item and receives a full refund. Please read our Refunds Policy for more details.
          </p>
        </details>
      </div>
    </div>
  );
};

export default FAQ;
export { FAQ };
