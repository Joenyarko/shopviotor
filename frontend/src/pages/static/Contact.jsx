import React from 'react';

const Contact = () => {
  return (
    <div className="max-w-xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Contact Us</h1>
      <p className="text-secondary-600 dark:text-secondary-400">
        Have questions or need support? Reach out directly via email or our hotline.
      </p>
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6 space-y-4">
        <div>
          <span className="block text-xs font-semibold text-secondary-450 uppercase">Email Address</span>
          <span className="text-sm font-medium text-secondary-900 dark:text-white">support@viotor.com</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-secondary-450 uppercase">Phone Helpline</span>
          <span className="text-sm font-medium text-secondary-900 dark:text-white">+233 24 123 4567</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-secondary-450 uppercase">HQ Address</span>
          <span className="text-sm font-medium text-secondary-900 dark:text-white">Spintex Road, Accra, Ghana</span>
        </div>
      </div>
    </div>
  );
};

export default Contact;
export { Contact };
