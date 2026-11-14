import React from 'react';
import { 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Mail, 
  Phone,
  FileText
} from 'lucide-react';

const Refunds = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="border-b border-secondary-200 dark:border-secondary-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <RotateCcw className="w-3.5 h-3.5" /> Buyer Protection & Guarantees
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
          Returns & Refund Policy
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Last Updated & Effective: November 14, 2026 | Operating under Ghana Consumer Protection Standards
        </p>
      </div>

      {/* Highlights Card */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          The Shop Viotor Escrow Guarantee
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          At Shop Viotor, we operate a <strong>Buyer Escrow Protection System</strong>. When you pay for any order using Mobile Money (MTN, Telecel, AT) or Visa/Mastercard, your payment is held securely in escrow by Shop Viotor. The vendor receives payout only after you receive and verify the item or after the 48-hour inspection period passes without a dispute. If an item is not delivered, arrives damaged, or is significantly not as described, you are guaranteed a full refund.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-secondary-700 dark:text-secondary-300 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            1. Return Eligibility & Inspection Window
          </h2>
          <p>
            We offer a <strong>7-Day Return Policy</strong> for eligible items, provided you contact our support team within <strong>48 hours of physical delivery</strong> to report any defect, discrepancy, or damage.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Eligible for Return & Refund
              </span>
              <ul className="list-disc pl-5 text-xs text-secondary-600 dark:text-secondary-400 space-y-1">
                <li>Defective, malfunctioning, or dead-on-arrival electronic devices.</li>
                <li>Items with physical transit damage reported within 48 hours.</li>
                <li>Items significantly different from the advertised specifications, brand, or condition grade.</li>
                <li>Missing components, accessories, or incomplete shipments.</li>
                <li>Incorrect item delivered by the vendor.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
              <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Non-Returnable Items
              </span>
              <ul className="list-disc pl-5 text-xs text-secondary-600 dark:text-secondary-400 space-y-1">
                <li>Perishable food, groceries, or consumable products.</li>
                <li>Intimate apparel, cosmetics, personal hygiene products once opened.</li>
                <li>Digital downloads, vouchers, and game activation codes once redeemed.</li>
                <li>Products with broken warranty seals, customer-inflicted water/drop damage, or tampered serial numbers.</li>
                <li>Items returned past the 7-day eligibility window without prior notice.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            2. Order Cancellations
          </h2>
          <div className="space-y-2">
            <p><strong>A. Standard Retail Orders:</strong></p>
            <p>
              You may cancel any standard retail order free of charge <strong>before</strong> the vendor has handed it over to the dispatch rider. Upon pre-dispatch cancellation, a <strong>100% full refund</strong> is immediately initiated to your original payment method. Once an order has been dispatched and is in transit, it cannot be cancelled; you must receive the delivery and initiate a standard return.
            </p>

            <p className="pt-2"><strong>B. Layaway Savings Plans:</strong></p>
            <p>
              If you decide to cancel an active Layaway plan before 100% completion, all installments paid will be refunded to you minus an administrative restocking fee (capped at 10% of the total product value) to cover holding costs and vendor reservations.
            </p>

            <p className="pt-2"><strong>C. Hire Purchase Agreements:</strong></p>
            <p>
              Hire Purchase contracts are legally binding credit agreements. If a customer wishes to terminate an agreement early, the item must be returned in good working condition. Refunds for deposits and installments will be evaluated based on the item's residual market value minus wear-and-tear and administrative fees.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            3. Step-by-Step Return Process
          </h2>
          <p>Initiating a return is simple and transparent:</p>
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-secondary-900 font-bold text-xs flex items-center justify-center shrink-0">1</span>
              <div>
                <span className="font-bold text-secondary-900 dark:text-white text-xs block">Submit Return Request Within 48 Hours</span>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                  Contact Shop Viotor Support via WhatsApp or email (<span className="text-primary-600 dark:text-primary-400 font-semibold">support@shopviotor.com</span>) citing your Order Reference number (e.g., #VIO-XXXXX).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-secondary-900 font-bold text-xs flex items-center justify-center shrink-0">2</span>
              <div>
                <span className="font-bold text-secondary-900 dark:text-white text-xs block">Provide Photographic / Video Proof</span>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                  Provide clear photos or a short video demonstrating the defect, transit damage, or incorrect item received, including serial numbers and packaging.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-secondary-900 font-bold text-xs flex items-center justify-center shrink-0">3</span>
              <div>
                <span className="font-bold text-secondary-900 dark:text-white text-xs block">Escrow Lock & Return Verification</span>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                  The vendor's payout is frozen immediately. You will receive return drop-off instructions for a nearby Shop Viotor Hub (Accra / ATU Campus) or a courier pickup will be arranged.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-secondary-900 font-bold text-xs flex items-center justify-center shrink-0">4</span>
              <div>
                <span className="font-bold text-secondary-900 dark:text-white text-xs block">Inspection & Refund Disbursal</span>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                  Upon receipt and inspection of the returned item, our quality assurance team approves the refund. Funds are credited automatically back to your payment account.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - Refund Timelines (Paystack Specific) */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. Refund Methods & Settlement Timelines
          </h2>
          <p>
            All approved refunds are credited directly back to the <strong>original source of payment</strong> through our payment gateway partner, <strong>Paystack</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">
                Mobile Money (MTN, Telecel, AT)
              </span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Refunds are processed within <strong>24 to 72 business hours</strong> directly to your mobile wallet. You will receive an SMS confirmation from your telecom provider.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">
                Debit / Credit Cards (Visa & Mastercard)
              </span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Refunds are posted via Paystack within <strong>3 to 7 business days</strong>. Depending on your issuing bank in Ghana, it may take up to 10 days to reflect on your card statement.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            5. Return Shipping Costs
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Vendor / Viotor Error:</strong> If the item is defective, damaged in transit, or incorrect, Shop Viotor or the merchant covers 100% of the return courier fees.</li>
            <li><strong>Buyer Change of Mind:</strong> If a return is granted for buyer convenience (where accepted by the vendor), the customer covers the return shipping cost.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            6. Need Assistance With a Return?
          </h2>
          <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800 space-y-2 text-xs">
            <p>Our dedicated disputes and refunds desk is here to help:</p>
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary-500" /> <strong>Disputes & Returns Email:</strong> <a href="mailto:support@shopviotor.com" className="text-primary-600 dark:text-primary-400 underline">support@shopviotor.com</a></p>
            <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary-500" /> <strong>Dispute Review Hours:</strong> Monday – Saturday, 8:00 AM – 6:00 PM GMT</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Refunds;
export { Refunds };
