import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  FileCheck, 
  UserCheck, 
  AlertCircle, 
  Mail, 
  MapPin,
  CheckCircle2
} from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="border-b border-secondary-200 dark:border-secondary-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Data Protection & Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Last Updated & Effective: November 26, 2026 | Compliant with Ghana Data Protection Act, 2012 (Act 843)
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Our Privacy & Payment Security Commitment
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          At Shop Viotor Ventures, we consider the privacy and security of your personal and financial information paramount. We adhere strictly to the <strong>Data Protection Act, 2012 (Act 843) of the Republic of Ghana</strong>. We do <strong>not</strong> store or have access to your complete debit/credit card numbers or Mobile Money PINs. Once activated, online card and mobile money payments for standard retail checkout orders paid in full are processed by <strong>Paystack</strong>.
        </p>
      </div>

      {/* Body Sections */}
      <div className="space-y-8 text-secondary-700 dark:text-secondary-300 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            1. Scope & Legal Basis for Processing
          </h2>
          <p>
            This Privacy Policy describes how Shop Viotor collects, uses, stores, shares, and protects your personal data when you visit our website, register an account, make purchases, apply for Hire Purchase or Layaway programs, or operate a merchant store.
          </p>
          <p>
            Under Section 20 of the Ghana Data Protection Act (Act 843), we process your personal data primarily on the legal grounds of:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Contractual Performance:</strong> Processing necessary to fulfill your purchase orders, dispatch shipments, and settle payments.</li>
            <li><strong>Legal & Regulatory Compliance:</strong> Fulfilling anti-money laundering (AML), tax reporting, and consumer protection mandates.</li>
            <li><strong>Legitimate Interests:</strong> Preventing marketplace fraud, verifying identity, securing our servers, and enhancing user experience.</li>
            <li><strong>Consent:</strong> Explicit user opt-in for newsletters and promotional campaign communications.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            2. Personal Data We Collect
          </h2>
          <p>We collect only the minimum personal information necessary to deliver our services safely:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1.5">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">A. Account & Contact Information</span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Full name, email address, mobile telephone number, physical delivery address (street, city, region in Ghana), and account login credentials (passwords stored using salted one-way hashing).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1.5">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">B. KYC & Verification Documents</span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                For vendor verification and buyers entering separate Hire Purchase agreements: Ghana Card number/photo, Student ID, proof of residence, or business registration certificates to prevent fraud.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1.5">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">C. Order & Transaction Records</span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Purchase history, order numbers, payment references, items purchased, shipping logs, customer service tickets, and dispute mediation evidence.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1.5">
              <span className="font-bold text-secondary-900 dark:text-white text-xs block">D. Technical & Device Metadata</span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                IP address, browser type, device operating system, access timestamps, and essential session cookies necessary for shopping cart preservation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 - Payment Card Privacy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            3. Online Checkout Payment Security
          </h2>
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <Lock className="w-4 h-4" /> Zero Cardholder Data Retention
            </div>
            <p className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed">
              Online card and mobile money payments for standard retail orders paid in full at checkout are processed securely by <strong>Paystack</strong>. Direct Mobile Money payments to Shop Viotor Ventures use registered <strong>Merchant ID 715041 (Shop Viotor Ventures)</strong>. For third-party marketplace vendor purchases, customers pay directly to the vendor&apos;s own Mobile Money number (or via Paystack automatic split settlement where enabled); Shop Viotor does not collect or hold vendor funds.
            </p>
            <ul className="list-disc pl-5 text-xs text-secondary-600 dark:text-secondary-400 space-y-1">
              <li>Shop Viotor <strong>never</strong> receives, views, or records your complete card PAN, CVV, or Mobile Money PIN.</li>
              <li>Checkout communications are protected using TLS encryption.</li>
              <li>For online checkout orders, Shop Viotor receives only a transaction reference and payment confirmation status.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. How We Use Your Personal Data
          </h2>
          <p>We process your data strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Fulfilling Orders:</strong> Processing standard online checkouts, dispatching goods via logistics riders, and delivering confirmation notices.</li>
            <li><strong>Order Support & Mediation:</strong> Assisting buyers and vendors with delivery confirmation, returns, and dispute resolution.</li>
            <li><strong>Separate Offline Arrangements:</strong> Verifying identity for separate Hire Purchase or Layaway arrangements agreed directly with Shop Viotor Ventures outside online checkout.</li>
            <li><strong>Identity Verification & Anti-Fraud:</strong> Verifying vendor identities before listing approval and screening out fraudulent barter proposals.</li>
            <li><strong>Customer Support:</strong> Assisting you via WhatsApp, email, or telephone regarding order tracking, refunds, and technical inquiries.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            5. Data Sharing & Third-Party Disclosure
          </h2>
          <p>
            We <strong>do not sell, monetize, or rent</strong> your personal information to third-party marketing companies. Data is shared strictly on a confidential need-to-know basis with:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Logistics & Courier Partners:</strong> Only your name, shipping address, and telephone number are disclosed to courier riders to ensure accurate doorstep delivery.</li>
            <li><strong>Online Checkout Payment Processor (Paystack):</strong> Transmitting transaction amounts, currency (GHS), and customer email strictly for standard online checkout orders paid in full.</li>
            <li><strong>Law Enforcement & Regulatory Authorities:</strong> Only when compelled by court orders, lawful subpoenas, or under Ghana anti-money laundering investigations.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            6. Data Retention & Security Architecture
          </h2>
          <p>
            We implement industry-standard administrative, physical, and technical controls to safeguard your data. This includes database firewalls, role-based access control, cryptographic password hashing (bcrypt), and automated audit logs. 
          </p>
          <p>
            Transactional records are retained for seven (7) years in compliance with statutory Ghanaian tax and accounting laws, after which they are securely expunged or anonymized. KYC verification documents submitted for temporary reviews are stored in encrypted environments and deleted upon account termination.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            7. Your Legal Rights as a Data Subject (Act 843)
          </h2>
          <p>
            Under the provisions of the Ghana Data Protection Act (Act 843), you are entitled to exercise the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Right of Access:</strong> Request a copy of all personal records we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate, incomplete, or outdated data.</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your personal information where no statutory retention obligation exists.</li>
            <li><strong>Right to Object:</strong> Object to the processing of your data for direct marketing purposes.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            8. Contact Our Data Protection Team
          </h2>
          <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800 space-y-2 text-xs">
            <p>If you have any questions or wish to exercise your data privacy rights, please reach out to us:</p>
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary-500" /> <strong>Data Protection Email:</strong> <a href="mailto:privacy@shopviotor.com" className="text-primary-600 dark:text-primary-400 underline">privacy@shopviotor.com</a> (or <a href="mailto:support@shopviotor.com" className="text-primary-600 dark:text-primary-400 underline">support@shopviotor.com</a>)</p>
            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-500" /> <strong>Office Address:</strong> Shop Viotor Ventures, Accra Central Commercial Corridor, Greater Accra, Ghana</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Privacy;
export { Privacy };
