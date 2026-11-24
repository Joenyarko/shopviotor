import React from 'react';

const FAQ = () => {
  const faqs = [
    { q: 'How does Barter swap work?', a: 'You submit a swap request on a product by offering items to trade. If there is an agreed cash difference between the parties, it is paid directly to the other party. Shop Viotor does not receive or hold any barter payments.' },
    { q: 'What is Hire Purchase?', a: 'Hire Purchase allows eligible customers to pay a deposit on a product and take delivery, then pay off the balance in monthly installments under a separate agreement with Shop Viotor Ventures.' },
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
            Vendors must complete our verification process before they can list products on the platform. This involves submitting valid government-issued ID documents (such as a Ghana Card) and valid contact details. Our admin team reviews and approves these documents to maintain trust on the marketplace.
          </p>
        </details>

        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            How do payments work on Shop Viotor?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            For online purchases processed at checkout, payments are completed in full via Paystack. For marketplace vendor products, customers pay directly to the vendor&apos;s own Mobile Money number. Shop Viotor does not collect, hold, or escrow customer funds for third-party vendor sales.
          </p>
        </details>

        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            Can users transfer money to each other on Shop Viotor?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            No. Shop Viotor does not operate wallets, hold balances, or support money transfers between users. Vendors are paid directly by customers to the vendor&apos;s own Mobile Money number.
          </p>
        </details>
        
        <details className="group bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-xl cursor-pointer">
          <summary className="font-bold text-secondary-900 dark:text-white list-none flex justify-between items-center">
            How are disputes and refunds handled?
            <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400 text-sm">
            If an item arrives damaged or not as described, the buyer can contact support within 48 hours of delivery. Shop Viotor can help mediate the issue between the parties, but any refund or replacement is arranged directly between the buyer and the vendor. For direct store purchases paid online via Paystack, standard return terms apply.
          </p>
        </details>
      </div>
    </div>
  );
};

export default FAQ;
export { FAQ };
