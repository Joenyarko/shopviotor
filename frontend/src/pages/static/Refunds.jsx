import React from 'react';

const Refunds = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Returns & Refund Policy</h1>
        <p className="text-secondary-500 dark:text-secondary-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">1. Refunds and Cancellations</h2>
          <p>
            As an online marketplace, Viotor holds payments in escrow to protect both buyers and sellers. Our refund policy depends on the nature of the transaction:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Direct Purchases:</strong> Buyers may cancel an order for a full refund before the item has been shipped by the vendor. Once shipped, refunds are only issued if the item is significantly not as described or arrives damaged.</li>
            <li><strong>Layaway & Hire Purchase:</strong> If a buyer defaults on a layaway or hire purchase plan for an extended period, the plan may be cancelled. Partial refunds for contributions made will be issued minus an administrative cancellation fee (typically 10-15% of the paid amount), as agreed upon during checkout.</li>
            <li><strong>Barter Trades:</strong> Barter trades are final once both parties accept and swap items. However, if a user misrepresents their item, Viotor will step in to mediate the dispute.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">2. Dispute Resolution</h2>
          <p>
            Viotor acts as a neutral mediator in disputes between buyers and vendors. If a buyer is dissatisfied with a purchase, they must open a dispute via the Viotor dashboard within 48 hours of delivery. 
          </p>
          <p>
            During a dispute:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The vendor's payout is paused.</li>
            <li>Our support team will request photo evidence and statements from both parties.</li>
            <li>If the vendor is found at fault (e.g., selling defective goods), the buyer will return the item, and Viotor will issue a full refund to the buyer.</li>
            <li>If the buyer is found at fault (e.g., buyer's remorse), the payout will be released to the vendor, and no refund will be issued.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">3. Return Process</h2>
          <p>
            To initiate a return:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contact Viotor Support via the chat interface within 48 hours of receiving the item.</li>
            <li>Provide your order/transaction ID and clear evidence of the issue (photos/videos).</li>
            <li>Once approved, you will receive instructions on how to return the item to the vendor or a Viotor hub.</li>
            <li>Refunds will be processed to the original payment method (Mobile Money or Card) within 3-5 business days after the return is confirmed.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default Refunds;
export { Refunds };
