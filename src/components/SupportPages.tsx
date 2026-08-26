import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronDown, ChevronUp, Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: 'What are your delivery timeframes across the Philippines?', a: 'Metro Manila orders are typically delivered within 2–3 business days. Provincial Luzon takes 3–5 business days, while Visayas and Mindanao destinations take 5–7 business days via our courier partners (LBC, J&T Express).' },
    { q: 'How does free shipping work?', a: 'Free standard nationwide shipping is automatically applied at checkout on all orders with a subtotal equal to or greater than ₱2,500.' },
    { q: 'What discount vouchers are available?', a: 'You can enter promo code "PWD" or "SENIOR" during checkout for a statutory 20% discount on your subtotal, or "WELCOME10" for 10% off your initial order.' },
    { q: 'What is your return & exchange policy?', a: 'We provide a 30-day exchange window for any sizing or defect concerns. Items must remain unwashed, unworn, and have all original C-HUB hangtags intact.' },
    { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), GCash, Maya, PayPal, and all major Credit & Debit Cards (Visa, Mastercard).' }
  ];

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">Help Center</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-base text-stone-900 dark:text-white"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-amber-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />}
              </button>
              {isOpen && (
                <p className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ShippingPage: React.FC = () => {
  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">Logistics & Rates</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
          Shipping & Delivery
        </h1>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-white uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Destination</th>
                <th className="py-3 px-4">Estimated Delivery</th>
                <th className="py-3 px-4 rounded-r-xl">Shipping Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">Metro Manila</td>
                <td className="py-3.5 px-4">2 – 3 Business Days</td>
                <td className="py-3.5 px-4">₱150 (FREE on orders ≥ ₱2,500)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">Greater Luzon</td>
                <td className="py-3.5 px-4">3 – 5 Business Days</td>
                <td className="py-3.5 px-4">₱150 (FREE on orders ≥ ₱2,500)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">Visayas & Mindanao</td>
                <td className="py-3.5 px-4">5 – 7 Business Days</td>
                <td className="py-3.5 px-4">₱150 (FREE on orders ≥ ₱2,500)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
          <p className="font-bold">Tracking Your Package:</p>
          <p>Once your order is processed, a tracking number and courier link will be synced directly to your order summary in your account.</p>
        </div>
      </div>
    </div>
  );
};

export const ReturnsPage: React.FC = () => {
  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">Peace of Mind</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
          30-Day Returns & Exchanges
        </h1>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
        <p>
          We want you to love everything you get from C-HUB. If you're not completely satisfied with the fit or style, you can request an exchange or return within 30 days of receiving your package.
        </p>

        <h3 className="font-bold text-base text-stone-900 dark:text-white">Return Eligibility:</h3>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li>Item must be in original condition: unworn, unwashed, and undamaged.</li>
          <li>All original tags, labels, and packaging must be attached.</li>
          <li>For hygienic reasons, opened underwear items cannot be returned unless verified defective.</li>
        </ul>
      </div>
    </div>
  );
};

export const SizeGuidePage: React.FC = () => {
  return (
    <div className="w-full max-w-[900px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">Fit Guide</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
          Official Size Guide
        </h1>
      </div>

      {/* Tops / Tees / Hoodies Table */}
      <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
          Apparel & Tops (Inches)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-white uppercase font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-4 rounded-l-xl">Size</th>
                <th className="py-2.5 px-4">Chest</th>
                <th className="py-2.5 px-4">Length</th>
                <th className="py-2.5 px-4 rounded-r-xl">Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
              <tr><td className="py-2.5 px-4 font-bold">S</td><td className="py-2.5 px-4">36 – 38"</td><td className="py-2.5 px-4">27"</td><td className="py-2.5 px-4">8.5"</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">M</td><td className="py-2.5 px-4">39 – 41"</td><td className="py-2.5 px-4">28"</td><td className="py-2.5 px-4">9.0"</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">L</td><td className="py-2.5 px-4">42 – 44"</td><td className="py-2.5 px-4">29"</td><td className="py-2.5 px-4">9.5"</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">XL</td><td className="py-2.5 px-4">45 – 47"</td><td className="py-2.5 px-4">30"</td><td className="py-2.5 px-4">10.0"</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Shoes Table */}
      <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
          Footwear Sizing Chart
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-white uppercase font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-4 rounded-l-xl">US Size</th>
                <th className="py-2.5 px-4">EU Size</th>
                <th className="py-2.5 px-4">UK Size</th>
                <th className="py-2.5 px-4 rounded-r-xl">Foot Length (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
              <tr><td className="py-2.5 px-4 font-bold">7</td><td className="py-2.5 px-4">40</td><td className="py-2.5 px-4">6.5</td><td className="py-2.5 px-4">25.0 cm</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">8</td><td className="py-2.5 px-4">41</td><td className="py-2.5 px-4">7.5</td><td className="py-2.5 px-4">26.0 cm</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">9</td><td className="py-2.5 px-4">42.5</td><td className="py-2.5 px-4">8.5</td><td className="py-2.5 px-4">27.0 cm</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">10</td><td className="py-2.5 px-4">44</td><td className="py-2.5 px-4">9.5</td><td className="py-2.5 px-4">28.0 cm</td></tr>
              <tr><td className="py-2.5 px-4 font-bold">11</td><td className="py-2.5 px-4">45</td><td className="py-2.5 px-4">10.5</td><td className="py-2.5 px-4">29.0 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { showToast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill out all fields', 'warning');
      return;
    }
    setSent(true);
    showToast('Your message has been sent to C-HUB support!', 'success');
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">Get in Touch</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
          Contact C-HUB
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 dark:bg-stone-800 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase font-bold tracking-wider">Email Us</p>
              <p className="font-bold text-sm text-stone-900 dark:text-white">support@c-hub.ph</p>
              <p className="text-xs text-stone-500">24/7 online assistance</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 dark:bg-stone-800 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase font-bold tracking-wider">Call Hotline</p>
              <p className="font-bold text-sm text-stone-900 dark:text-white">+63 (2) 8888-CHUB</p>
              <p className="text-xs text-stone-500">Mon–Sat 9AM–6PM PHT</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-stone-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase font-bold tracking-wider">Headquarters</p>
              <p className="font-bold text-sm text-stone-900 dark:text-white">Bonifacio Global City</p>
              <p className="text-xs text-stone-500">Taguig, Metro Manila, Philippines</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            {sent ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif">Message Delivered!</h3>
                <p className="text-xs text-stone-500">Our customer support representative will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="maria@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-400 dark:text-stone-950 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
