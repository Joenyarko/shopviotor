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
          <RotateCcw className="w-3.5 h-3.5" /> Buyer Protection & Returns
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
          Returns & Refund Policy
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Last Updated & Effective: November 24, 2026 | Operating under Ghana Consumer Protection Standards
        </p>
      </div>

      {/* Highlights Card */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Buyer Protection & Fair Return Standards
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          At Shop Viotor, we are committed to transparent commerce and customer satisfaction. For standard retail orders paid in full online via <strong>Paystack</strong>, eligible returns and cancellations are processed directly through Paystack. For items purchased from independent marketplace vendors where customers pay vendors directly via Mobile Money, return requests and replacements are coordinated according to our verified merchant standards.
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
            <p><strong>A. Standard Retail Orders (Online Checkout via Paystack):</strong></p>
            <p>
              You may cancel any standard retail order paid online via Paystack before the package has been dispatched. Upon pre-dispatch cancellation, a full refund is initiated to your original payment method via Paystack. Once an order has been dispatched, it must be received and processed through the standard return procedure.
            </p>

            <p className="pt-2"><strong>B. Layaway Arrangements:</strong></p>
            <p>
              Layaway plans are separate offline arrangements with Shop Viotor Ventures and are not processed through Paystack. Cancellation and refund terms are governed strictly by the individual written agreement agreed upon with Shop Viotor Ventures.
            </p>

            <p className="pt-2"><strong>C. Hire Purchase Agreements:</strong></p>
            <p>
              Hire Purchase contracts are independent written agreements agreed directly between the customer and Shop Viotor Ventures, not processed through Paystack. Any termination or adjustment is governed strictly by the signed contract.
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
                  Contact Shop Viotor Support via WhatsApp or email (<span className="text-primary-600 dark:text-primary-400 font-semibold">support@shopviotor.com</span>) citing your Order Reference number.
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
                <span className="font-bold text-secondary-900 dark:text-white text-xs block">Return Review & Hub Verification</span>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                  Our support team reviews the claim and coordinates return drop-off to our Shop Viotor Hub (Accra Central / ATU Campus) or arranges courier collection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-secondary-900 font-bold text-xs flex items-center justify-center shrink-0">4</span>
              <div>
                <span className="font-bold text-secondary-900 dark:text-white text-xs block">Inspection & Resolution</span>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-0.5">
                  Upon receipt and inspection of the returned product, replacement or refund is approved. For orders paid online via Paystack, the refund is initiated directly via Paystack.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. Refund Methods & Timelines
          </h2>
          <p>
            Online card and mobile money payments at checkout are processed by Paystack. For eligible orders paid through Paystack, approved refunds are credited back to the original source of payment:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">
                Mobile Money via Paystack (MTN, Telecel, AT)
              </span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Refunds are processed within <strong>24 to 72 business hours</strong> directly to your mobile wallet, with SMS confirmation from your telecom provider.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">
                Debit / Credit Cards via Paystack (Visa & Mastercard)
              </span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Refunds are submitted via Paystack within <strong>3 to 7 business days</strong>. Reflection on your card statement depends on your issuing bank in Ghana.
              </p>
            </div>
          </div>
          <p className="text-xs text-secondary-500 mt-2">
            *Note: For vendor purchases paid directly to a vendor&apos;s Mobile Money number, refunds are issued directly between the vendor and the buyer. Shop Viotor does not collect, hold, or release funds for vendor sales.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            5. Return Shipping Costs
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Vendor / Product Defect:</strong> If the item is defective, damaged in transit, or incorrect, the vendor or Shop Viotor covers return courier fees.</li>
            <li><strong>Buyer Change of Mind:</strong> If a return is granted for buyer convenience (where accepted by the vendor), the customer covers the return shipping cost.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            6. Need Assistance With a Return?
          </h2>
          <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800 space-y-2 text-xs">
            <p>Our dedicated support and disputes desk is here to help:</p>
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