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
          Last Updated & Effective: November 14, 2026 | Operating under the laws of the Republic of Ghana
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-primary-50/60 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Key Commercial Summary
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          Shop Viotor is operated by <strong>Pawn 2 King Enterprise</strong>, a business registered under the laws of the Republic of Ghana. We operate a multi-service marketplace connecting verified buyers, merchants, and service providers. All financial transactions on our platform are processed through PCI-DSS Level 1 compliant infrastructure (including <strong>Paystack</strong> and accredited Mobile Money networks) with built-in buyer escrow protection.
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
            By accessing, browsing, registering for an account, or transacting on the Shop Viotor website (<span className="text-secondary-900 dark:text-white font-semibold">www.shopviotor.com</span>) and its associated API endpoints, you expressly acknowledge and agree to be bound by these Terms of Service, our Privacy Policy, Shipping & Delivery Policy, and Returns & Refund Policy.
          </p>
          <p>
            You must be at least <strong>18 years of age</strong> or possess the consent of a legal parent/guardian to use our services and make binding financial commitments. By creating an account, you represent and warrant that all information you provide is true, accurate, current, and complete.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            2. Scope of Services & Marketplace Architecture
          </h2>
          <p>
            Shop Viotor serves as an integrated digital commerce platform providing:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Direct Retail & Vendor Storefronts:</strong> Verified third-party vendors and Shop Viotor direct inventories offer consumer electronics, gadgets, appliances, fashion, and home goods for direct online sale.</li>
            <li><strong>Layaway Purchase Plans:</strong> A structured savings model enabling buyers to reserve products and complete payments in periodic installments before physical dispatch.</li>
            <li><strong>Hire Purchase Solutions:</strong> A credit financing service where eligible customers (including students and working professionals verified via KYC) receive goods upon deposit and complete scheduled monthly repayments.</li>
            <li><strong>Peer-to-Peer Barter Swaps:</strong> A platform for users to propose, negotiate, and execute physical item trades with escrow verification.</li>
            <li><strong>Community Raffles & Service Profiles:</strong> Regulated promotional drawings and a professional directory for certified technical service providers.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            3. Payments, Escrow & Payment Processor Compliance
          </h2>
          <p>
            Shop Viotor supports secure electronic payments in Ghanaian Cedis (<strong>GHS</strong>) via accredited payment partner <strong>Paystack Payments Limited</strong> and certified Ghanaian telecommunication networks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Mobile Money</span>
              <p className="text-xs text-secondary-500 mt-1">MTN MoMo, Telecel Cash, and AT Money instant checkout.</p>
            </div>
            <div className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Debit & Credit Cards</span>
              <p className="text-xs text-secondary-500 mt-1">Visa and Mastercard payments via encrypted Paystack popup.</p>
            </div>
            <div className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Escrow Security</span>
              <p className="text-xs text-secondary-500 mt-1">Funds locked in escrow until verified buyer delivery.</p>
            </div>
          </div>
          <p className="pt-2">
            <strong>Escrow Protection Mechanism:</strong> When a customer completes checkout, funds are debited from the customer's account and held in a secure settlement account. Vendor payouts are not released until the delivery of the product is confirmed by the buyer or the 48-hour post-delivery dispute window lapses without dispute.
          </p>
          <p>
            <strong>Payment Security Guarantee:</strong> Shop Viotor does not store or process complete debit/credit card numbers or Mobile Money PINs on our servers. All sensitive cardholder and mobile wallet authentication is handled through Paystack's PCI-DSS Level 1 compliant gateway.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. Layaway & Hire Purchase Obligations
          </h2>
          <div className="space-y-2">
            <p><strong>A. Layaway Terms:</strong></p>
            <p>
              When a buyer initiates a Layaway plan, the target product is reserved for the duration of the agreed schedule (typically up to 90 days). The product will only be released or dispatched once 100% of the purchase price has been received. If a customer chooses to cancel an ongoing layaway plan before completion, a refund of paid amounts will be issued minus an administrative restocking fee not exceeding 10% of the product price.
            </p>
            <p><strong>B. Hire Purchase Terms:</strong></p>
            <p>
              Hire purchase requires mandatory Know Your Customer (KYC) identity verification (Ghana Card, institutional or student ID, and valid phone contact). The buyer receives immediate physical possession upon payment of the initial down deposit. Title and ownership of the goods remain with Shop Viotor / Pawn 2 King Enterprise until the final installment is paid in full. Defaulting on scheduled repayments gives Shop Viotor the legal right to repossess the item and pursue lawful debt recovery.
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
            <li>Submit valid business registration or Ghana Card verification prior to requesting wallet payouts.</li>
            <li>Bear responsibility for return shipping costs if goods delivered are defective, damaged, or substantially different from the listing description.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            6. Prohibited Activities & Account Termination
          </h2>
          <p>
            Users and vendors may not engage in fraud, price gouging, money laundering, chargeback extortion, unauthorized scraping, or the sale of prohibited items (including weapons, illegal substances, stolen items, or counterfeit electronics). Shop Viotor reserves the right to immediately freeze accounts, cancel orders, withhold settlement funds, and report criminal conduct to the Ghana Police Service and cybercrime authorities.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            7. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by Ghanaian law, Shop Viotor, its parent company Pawn 2 King Enterprise, directors, and affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, courier transit delays, or disputes between buyers and independent vendors beyond our direct escrow protection. Our maximum aggregate liability for any claim shall not exceed the actual transaction amount paid by the customer.
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
            <p><strong>Operating Entity:</strong> Pawn 2 King Enterprise (Trading as Shop Viotor)</p>
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
