import React from 'react';
import { 
  ShieldAlert, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  Wallet, 
  UserCheck, 
  Scale, 
  Mail, 
  FileCheck
} from 'lucide-react';

const AcceptableUse = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="border-b border-secondary-200 dark:border-secondary-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Platform Integrity & Security
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
          Acceptable Use Policy (AUP)
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Last Updated & Effective: November 24, 2026 | Operating under Ghana Commercial and Consumer Protection Laws
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <Ban className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          Zero Tolerance for Illegal & Deceptive Activities
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          Shop Viotor Ventures enforces a strict Acceptable Use Policy to maintain a secure, ethical, and trustworthy marketplace in Ghana. This policy governs all buyers, merchants, service providers, and barter traders. Any attempt to use our platform or payment systems for prohibited goods, counterfeit trade, money laundering, or fraudulent activities will result in immediate termination and referral to law enforcement.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-secondary-700 dark:text-secondary-300 leading-relaxed text-sm">
        
        {/* Section 1 - Prohibited Goods */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            1. Strictly Prohibited Products & Services
          </h2>
          <p>
            You may <strong>not</strong> list, advertise, sell, buy, or trade any of the following items on Shop Viotor under any circumstances:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-2">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block text-rose-600 dark:text-rose-400">
                A. Illegal, Dangerous & Regulated Items
              </span>
              <ul className="list-disc pl-5 text-xs text-secondary-600 dark:text-secondary-400 space-y-1">
                <li>Weapons, firearms, air guns, ammunition, knives, and explosives.</li>
                <li>Illicit narcotics, prescription medications without FDA license, and drug paraphernalia.</li>
                <li>Hazardous chemicals, flammable substances, and toxic materials.</li>
                <li>Stolen property, hijacked electronics, and goods lacking legitimate proof of ownership.</li>
                <li>Endangered animal species, wildlife parts (ivory, skins), and flora.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-2">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block text-rose-600 dark:text-rose-400">
                B. Counterfeit, Fraudulent & High-Risk Goods
              </span>
              <ul className="list-disc pl-5 text-xs text-secondary-600 dark:text-secondary-400 space-y-1">
                <li>Counterfeit, knock-off, replica, or bootleg trademarked goods.</li>
                <li>Hacked software, cracked licenses, IPTV illicit streams, and card skimmers.</li>
                <li>Adult, pornographic, or sexually explicit content.</li>
                <li>Unregistered lotteries, betting schemes, or unlicensed financial services.</li>
                <li>Fake government credentials, counterfeit currency, or forged documentation.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 - Merchant Standards */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            2. Merchant & Vendor Conduct Standards
          </h2>
          <p>Merchants selling products or services on Shop Viotor agree to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Truth in Advertising:</strong> Provide accurate specifications, genuine product photographs, and clear disclosure of item condition (Brand New, Open Box, Refurbished, or Pre-Owned).</li>
            <li><strong>Accurate Payment Information:</strong> Provide accurate, verified Mobile Money recipient details in their store setup to receive payments directly from customers.</li>
            <li><strong>Prompt Dispatch:</strong> Prepare and hand over orders to verified logistics couriers within 48 hours of order placement.</li>
            <li><strong>Authenticity Guarantee:</strong> Vendors bear sole legal liability for intellectual property violations and counterfeit claims.</li>
          </ul>
        </section>

        {/* Section 3 - Buyer Conduct */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            3. Buyer Standards & Anti-Fraud Rules
          </h2>
          <p>Buyers transacting on Shop Viotor are prohibited from:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Payment & Chargeback Fraud:</strong> Using stolen cards, unapproved Mobile Money accounts, or initiating dishonest chargeback claims for delivered and verified goods.</li>
            <li><strong>Barter Integrity Violations:</strong> Sending misrepresented, defective, or empty packages in peer-to-peer barter exchanges.</li>
            <li><strong>Contractual Default:</strong> Defaulting on agreed commitments or attempting to pawn items under separate hire purchase agreements before acquiring full legal ownership.</li>
          </ul>
        </section>

        {/* Section 4 - Marketplace Financial Disclosure */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. Marketplace Architecture & Non-Banking Disclosure
          </h2>
          <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-2 text-xs">
            <span className="font-bold text-secondary-900 dark:text-white text-xs block flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-primary-500" /> Commercial Marketplace Disclosure
            </span>
            <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
              Shop Viotor is an online marketplace platform and is <strong>not a bank, deposit-taking institution, payment service provider, or money remittance entity</strong> under the laws of Ghana. 
            </p>
            <ul className="list-disc pl-5 space-y-1 text-secondary-600 dark:text-secondary-400">
              <li><strong>Direct Vendor Payments:</strong> Customers purchasing from third-party merchants pay vendors directly to the vendor&apos;s own Mobile Money account. Shop Viotor does not collect, hold, or escrow customer funds on behalf of vendors.</li>
              <li><strong>Online Checkout:</strong> Standard online purchases processed via the platform checkout are handled directly by Paystack, paid in full at the time of purchase.</li>
              <li><strong>No Custodial Wallets:</strong> Shop Viotor does not hold customer deposits or operate peer-to-peer money transfers.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 - Enforcement */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            5. Enforcement, Penalties & Legal Reporting
          </h2>
          <p>
            Any violation of this Acceptable Use Policy may result in immediate administrative action:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Immediate removal and delisting of non-compliant product listings.</li>
            <li>Permanent suspension or banning of user and merchant accounts.</li>
            <li>Cancellation of unfulfilled orders associated with fraudulent activities.</li>
            <li>Mandatory referral of counterfeiters and fraudsters to the Ghana Police Service (CID), the Cyber Security Authority (CSA), and relevant authorities.</li>
          </ul>
        </section>

        {/* Section 6 - Reporting Violations */}
        <section className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            6. Report Prohibited Listings & Abuse
          </h2>
          <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800 space-y-2 text-xs">
            <p>If you encounter a suspicious listing, counterfeit item, or policy violation, please notify our trust and compliance officers immediately:</p>
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary-500" /> <strong>Trust & Compliance Email:</strong> <a href="mailto:support@shopviotor.com" className="text-primary-600 dark:text-primary-400 underline">support@shopviotor.com</a></p>
            <p className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-primary-500" /> <strong>Legal Entity:</strong> Shop Viotor Ventures, Accra, Ghana</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AcceptableUse;
export { AcceptableUse };