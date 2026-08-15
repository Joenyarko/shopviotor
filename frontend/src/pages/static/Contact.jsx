import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Mock API Call - Replace with actual endpoint to send email
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">Contact Us</h1>
        <p className="text-secondary-600 dark:text-secondary-400 text-lg">
          Have questions or need support? Reach out directly via our contact form or hotline. We usually respond within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex items-start gap-4 hover:border-primary-500/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white">Email Us</h3>
              <a href="mailto:support@viotor.com" className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-1 block">support@viotor.com</a>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex items-start gap-4 hover:border-primary-500/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white">Call Us</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-1">+233 500 708 204</p>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">Mon-Sat: 9AM - 6PM</p>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex items-start gap-4 hover:border-primary-500/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white">Visit HQ</h3>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-1">Spintex Road</p>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">Accra, Ghana</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 md:p-8 lg:col-span-2 shadow-sm">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">Send a Message</h2>
          
          {status === 'success' && (
            <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-200">
              Your message has been sent successfully! We will get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-2">Your Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-2">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="john@example.com" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-2">Subject</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="How can we help?" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-2">Message</label>
              <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Type your message here..."></textarea>
            </div>

            <button type="submit" disabled={status === 'sending'} className="premium-button-primary w-full md:w-auto px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              {status === 'sending' ? 'Sending...' : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
export { Contact };
