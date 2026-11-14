import React from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail,
  Compass
} from 'lucide-react';

const Delivery = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="border-b border-secondary-200 dark:border-secondary-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5" /> Logistics & Fulfillment
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Last Updated & Effective: November 14, 2026 | Nationwide Coverage Across All 16 Regions of Ghana
        </p>
      </div>

      {/* Highlights Box */}
      <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2 text-base">
          <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Reliable Doorstep & Hub Delivery Across Ghana
        </h3>
        <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
          Shop Viotor partners with reputable dispatch riders and licensed nationwide parcel services to guarantee safe, timely, and trackable delivery. Every order is covered by our <strong>Escrow Protection</strong>, ensuring your funds are held safely until your package arrives safely at your doorstep or chosen pickup point.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-secondary-700 dark:text-secondary-300 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            1. Geographic Coverage & Delivery Zones
          </h2>
          <p>
            We deliver to homes, offices, university campuses, and commercial pickup points across all sixteen (16) administrative regions of Ghana:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Greater Accra Zone</span>
              <p className="text-xs text-secondary-500 mt-1">Accra Metro, Tema, Madina, Spintex, East Legon, Kasoa, Adenta, Achimota.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Regional Urban Hubs</span>
              <p className="text-xs text-secondary-500 mt-1">Kumasi, Takoradi, Cape Coast, Sunyani, Koforidua, Tamale, Ho, Techiman.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
              <span className="font-bold text-secondary-900 dark:text-white block text-xs">Nationwide Districts</span>
              <p className="text-xs text-secondary-500 mt-1">All other district capitals and municipal areas via certified parcel coaches.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            2. Estimated Delivery Timeframes
          </h2>
          <p>
            Delivery time starts from the moment your payment is cleared and the vendor packages the order:
          </p>

          <div className="border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden pt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-800/60 border-b border-secondary-200 dark:border-secondary-800 font-bold text-secondary-600 dark:text-secondary-300">
                  <th className="p-3">Destination</th>
                  <th className="p-3">Standard Delivery Time</th>
                  <th className="p-3">Service Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                <tr>
                  <td className="p-3 font-semibold text-secondary-900 dark:text-white">Greater Accra (Metropolitan)</td>
                  <td className="p-3 text-secondary-700 dark:text-secondary-300">24 – 48 Hours</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">Fast Doorstep</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-secondary-900 dark:text-white">Same-Day Priority (Accra)</td>
                  <td className="p-3 text-secondary-700 dark:text-secondary-300">Within 6 – 12 Hours (orders before 12 PM)</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 text-[10px]">Express Rider</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-secondary-900 dark:text-white">Ashanti Region (Kumasi Metro)</td>
                  <td className="p-3 text-secondary-700 dark:text-secondary-300">2 – 3 Business Days</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded font-bold bg-secondary-100 text-secondary-800 text-[10px]">Standard Intercity</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-secondary-900 dark:text-white">Other Regions (Central, Western, Volta, etc.)</td>
                  <td className="p-3 text-secondary-700 dark:text-secondary-300">3 – 5 Business Days</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded font-bold bg-secondary-100 text-secondary-800 text-[10px]">Regional Coach</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-secondary-500 italic mt-1">
            *Note: For <strong>Layaway Plans</strong>, items are dispatched only after 100% of installment payments have been completed. For <strong>Hire Purchase</strong>, items are dispatched upon successful KYC verification and deposit clearance.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            3. Shipping Options & Pickup Hubs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1.5">
              <span className="font-bold text-secondary-900 dark:text-white text-xs flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary-500" /> Doorstep Courier Delivery
              </span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Direct delivery to your residential or workplace address by verified dispatch riders. You will receive an SMS/call when the rider is en route with your package.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 space-y-1.5">
              <span className="font-bold text-secondary-900 dark:text-white text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" /> Official Shop Viotor Pickup Hubs
              </span>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                Collect orders at your convenience from our Accra Central / ATU Campus Commercial Hub with zero or reduced delivery charges upon presenting your Order Reference and valid ID.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            4. Shipping Fees & Transparent Pricing
          </h2>
          <p>
            Shipping fees are calculated automatically during checkout based on product weight, physical dimensions, and delivery distance. All shipping charges are displayed clearly in Ghanaian Cedis (<strong>GHS</strong>) before you proceed to payment via Paystack. There are no hidden fees or surprise delivery surcharges upon arrival.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            5. Package Inspection Upon Delivery
          </h2>
          <p>
            To protect your purchase under our <strong>Escrow Guarantee</strong>, please follow these guidelines when receiving your package:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Check the external packaging for signs of severe damage, tearing, or tampering before accepting.</li>
            <li>Verify that the product model, color, and included accessories match your order confirmation.</li>
            <li>If the package arrives visibly damaged, reject delivery or document the condition with clear photos and contact Shop Viotor Support within <strong>48 hours</strong>.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            6. Failed & Rescheduled Deliveries
          </h2>
          <p>
            If a dispatch rider is unable to reach you at your specified delivery address:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The rider will attempt up to two (2) phone calls to your registered number.</li>
            <li>The courier will hold the item at the local regional hub for up to three (3) business days to arrange a re-delivery.</li>
            <li>If the recipient remains unreachable after three attempts, the package will be returned to the vendor and refunded minus the standard courier cost.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
            7. Delivery Support & Tracking Inquiries
          </h2>
          <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800 space-y-2 text-xs">
            <p>For inquiries regarding dispatch tracking or changing your delivery address:</p>
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary-500" /> <strong>Dispatch Support:</strong> <a href="mailto:support@shopviotor.com" className="text-primary-600 dark:text-primary-400 underline">support@shopviotor.com</a></p>
            <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary-500" /> <strong>Logistics Operating Hours:</strong> Monday – Saturday, 8:00 AM – 6:00 PM GMT</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Delivery;
export { Delivery };
