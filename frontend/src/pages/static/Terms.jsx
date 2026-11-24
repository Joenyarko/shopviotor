import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Scale, 
  Lock, 
  AlertCircle, 
  Truck, 
  RefreshCw,
  Mail,
  MapPin,
  CheckCircle2
} from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="border-b border-secondary-200 dark:border-secondary-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-800 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" /> Legal & Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Last Updated & Effective: November 24, 2026 | Operating under the laws of the Republic of Ghana
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-primary-50/60 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Key Commercial Summary
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          Shop Viotor Ventures is a registered business under the laws of the Republic of Ghana. We operate a multi-vendor digital marketplace connecting buyers, independent merchants, and service providers. Online card and mobile money payments at checkout are processed by <strong>Paystack</strong>. For vendor sales, customers pay vendors directly to the vendor&apos;s own Mobile Money account; Shop Viotor does not collect, hold, or release customer funds on behalf of vendors.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-secondary-700 dark:text-secondary-300 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            1. Acceptance of Terms & Eligibility
          </h2>
          <p>
            By accessing, browsing, registering for an account, or transacting on the Shop Viotor website (<span className="text-secondary-900 dark:text-white font-semibold">www.shopviotor.com</span>) and its associated platform services, you expressly acknowledge and agree to be bound by these Terms of Service, our Privacy Policy, Shipping & Delivery Policy, and Returns & Refund Policy.
          </p>
          <p>
            You must be at least <strong>18 years of age</strong> or possess the consent of a legal parent/guardian to use our services and make binding commercial transactions. By creating an account, you represent and warrant that all information you provide is true, accurate, current, and complete.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            2. Scope of Services & Marketplace Architecture
          </h2>
          <p>
            Shop Viotor serves as an integrated digital commerce marketplace providing:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Direct Retail & Vendor Storefronts:</strong> An online marketplace where independent vendors and Shop Viotor showcase consumer electronics, appliances, gadgets, fashion, and home goods for direct sale. Customers pay vendors directly via Mobile Money.</li>
            <li><strong>Layaway Purchase Arrangements:</strong> A separate arrangement agreed directly between the customer and Shop Viotor Ventures outside of the online checkout, not processed through Paystack, where products are reserved and released upon receipt of full payment.</li>
            <li><strong>Hire Purchase Arrangements:</strong> A separate offline arrangement agreed directly between eligible verified customers and Shop Viotor Ventures outside of the online checkout, not processed through Paystack, governed by a separate agreement.</li>
            <li><strong>Peer-to-Peer Barter Swaps:</strong> A direct negotiation platform enabling users to arrange item exchanges without Shop Viotor taking custody of goods or holding payments.</li>
            <li><strong>Service Directory:</strong> A professional directory connecting customers with local technical and trade service providers.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            3. Payments & Payment Processor Compliance
          </h2>
          <p>
            Shop Viotor supports transparent electronic payment options in Ghanaian Cedis (<strong>GHS</strong>):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Direct Mobile Money</span>
              <p className="text-xs text-secondary-500 mt-1">Direct transfers to the vendor&apos;s own Mobile Money number (MTN MoMo, Telecel Cash, AT Money).</p>
            </div>
            <div className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Online Checkout (Paystack)</span>
              <p className="text-xs text-secondary-500 mt-1">Debit/credit cards and Mobile Money for standard retail orders paid in full at checkout.</p>
            </div>
            <div className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">No Custodial Holding</span>
              <p className="text-xs text-secondary-500 mt-1">Shop Viotor does not collect, hold, or escrow customer money for vendor sales.</p>
            </div>
          </div>
          <p className="pt-2">
            <strong>Payment Processing & Direct Vendor Transfers:</strong> Online card and mobile money payments at checkout are processed by Paystack for standard retail orders paid in full. When purchasing from third-party marketplace vendors, payments are made directly by the customer to the vendor&apos;s designated Mobile Money number. Shop Viotor does not collect, hold, or release customer funds on behalf of vendors.
          </p>
          <p>
            <strong>Payment Security:</strong> Online card and mobile money payments at checkout are processed by Paystack. Shop Viotor does not store or process complete debit/credit card numbers or Mobile Money PINs on its servers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. Layaway & Hire Purchase Arrangements
          </h2>
          <div className="space-y-2">
            <p><strong>A. Layaway Terms:</strong></p>
            <p>
              Layaway is not processed through the website checkout or Paystack. It is a separate arrangement agreed directly between the customer and Shop Viotor Ventures outside of the website checkout (for example via WhatsApp or in person). The item is reserved and is released only after full payment is received. Any cancellation or refund terms are handled directly according to the specific agreement established with Shop Viotor Ventures.
            </p>
            <p className="pt-2"><strong>B. Hire Purchase Terms:</strong></p>
            <p>
              Hire purchase is not processed through the website checkout or Paystack, and carries 0% interest (the cash price of Shop Viotor Ventures&apos; own goods split into agreed installments). It is a separate arrangement agreed directly between the customer and Shop Viotor Ventures outside the checkout, under a separate agreement. Installment payments are made directly via Mobile Money and recorded only after admin confirmation. It requires identity verification (Ghana Card). Physical items are handed over upon payment of the agreed deposit, while title and ownership remain with Shop Viotor Ventures until the final installment is paid in full. Defaulting on scheduled repayments gives Shop Viotor Ventures the right to repossess the item and pursue lawful recovery in accordance with that separate agreement. Any future interest-bearing credit or financing service would only be offered after obtaining the required regulatory licence.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            5. Vendor Storefronts & Merchant Responsibilities
          </h2>
          <p>
            Merchants operating digital storefronts on Shop Viotor agree to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>List only genuine, non-counterfeit products with accurate condition grades (New, Open-Box, Refurbished, Pre-Owned).</li>
            <li>Ship orders within two (2) business days of receiving an order confirmation.</li>
            <li>Maintain inventory accuracy and honor advertised prices in Ghanaian Cedis (GHS).</li>
            <li>Provide their own Mobile Money number in their store setup to receive payments directly from customers.</li>
            <li>Bear responsibility for return shipping costs if goods delivered are defective, damaged, or substantially different from the listing description.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            6. Prohibited Activities & Account Termination
          </h2>
          <p>
            Users and vendors may not engage in fraud, price gouging, money laundering, chargeback extortion, unauthorized scraping, or the sale of prohibited items (including weapons, illegal substances, stolen items, or counterfeit electronics). Shop Viotor reserves the right to immediately suspend accounts, cancel unfulfilled orders, delist violating products, and report criminal conduct to the Ghana Police Service and relevant authorities.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            7. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by Ghanaian law, Shop Viotor Ventures, its directors, and affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, courier transit delays, or disputes between buyers and independent vendors. For vendor sales, customers pay vendors directly and Shop Viotor does not collect, hold, or release vendor funds. Our maximum aggregate liability for any direct purchase fulfilled by Shop Viotor shall not exceed the actual transaction amount paid by the customer.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            8. Governing Law & Dispute Jurisdiction
          </h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the statutory laws of the <strong>Republic of Ghana</strong>, including the Electronic Transactions Act (Act 772) and the Sale of Goods Act, 1962 (Act 137). Any legal claim or dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts sitting in Accra, Ghana.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            9. Contact & Registered Business Information
          </h2>
          <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800 space-y-2 text-xs">
            <p><strong>Operating Entity:</strong> Shop Viotor Ventures</p>
            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-500" /> <strong>Headquarters:</strong> Accra Central / ATU Commercial Corridor, Greater Accra, Ghana</p>
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary-500" /> <strong>Official Support Email:</strong> <a href="mailto:support@shopviotor.com" className="text-primary-600 dark:text-primary-400 underline">support@shopviotor.com</a></p>
            <p><strong>Customer Care Hours:</strong> Monday – Saturday, 8:00 AM – 6:00 PM GMT</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Terms;
export { Terms };