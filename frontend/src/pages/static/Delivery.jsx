import React from 'react';

const Delivery = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Shipping & Delivery Policy</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">1. Delivery Methods</h2>
          <p>
            Viotor facilitates trades and purchases between independent vendors and buyers. Depending on the agreement and the specific service (Layaway, Barter, Direct Sale, or Hire Purchase), delivery is handled in one of the following ways:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>In-Person Pickup:</strong> Buyers can collect items directly from verified vendor locations or designated Viotor pickup points (e.g., ATU Campus, Accra Office).</li>
            <li><strong>Vendor Delivery:</strong> Vendors may offer direct shipping to the buyer's address using third-party logistics.</li>
            <li><strong>Viotor Escrow Delivery:</strong> For high-value items or disputed trades, Viotor may mediate the delivery to ensure product quality before finalizing the payout to the vendor.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">2. Delivery Timeframes</h2>
          <p>
            Standard delivery times vary based on the vendor's location and the buyer's address. Typically, local deliveries within Accra are completed within 1-3 business days. Nationwide deliveries may take 3-7 business days.
          </p>
          <p>
            <strong>For Layaway & Hire Purchase:</strong> Items are only dispatched for delivery or made available for pickup once the final payment installment has been successfully received and cleared by Viotor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">3. Shipping Costs</h2>
          <p>
            Shipping costs are determined by the vendor and the delivery courier. These costs will be clearly displayed at checkout before payment is made. For barter trades, shipping responsibilities must be agreed upon by both parties via the Viotor chat system.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">4. Damaged or Lost Items</h2>
          <p>
            Buyers must inspect items immediately upon delivery. If an item arrives damaged or is lost in transit, the buyer must report it to Viotor Support within 24 hours. Viotor holds the vendor's funds in escrow until delivery is confirmed, ensuring buyers are protected against non-delivery.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Delivery;
export { Delivery };
