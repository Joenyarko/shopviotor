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
      </div>
    </div>
  );
};

export default FAQ;
export { FAQ };
