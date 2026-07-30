import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Truck } from 'lucide-react';
import api from '../../services/api';

const Settings = () => {
  const [siteName, setSiteName] = useState('Shop Viotor');
  const [momoTax, setMomoTax] = useState('1.0');
  const [defaultShippingFee, setDefaultShippingFee] = useState('0');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        const data = res.data.data;
        if (data.site_name) setSiteName(data.site_name);
        if (data.momo_tax) setMomoTax(data.momo_tax);
        if (data.default_shipping_fee) setDefaultShippingFee(data.default_shipping_fee);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings', {
        site_name: siteName,
        momo_tax: momoTax,
        default_shipping_fee: defaultShippingFee,
      });
      Swal.fire({ title: 'Success', text: 'Global settings saved successfully.', icon: 'success' });
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'Error', text: 'Failed to save settings.', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-secondary-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary-500" /> Platform Settings
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Configure global application variables, taxes, and shipping rates.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-8">
        
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2 border-b border-secondary-100 dark:border-secondary-800 pb-2">
            General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase">Store / Site Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase">Momo Service Surcharge (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={momoTax}
                onChange={(e) => setMomoTax(e.target.value)}
                className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2 border-b border-secondary-100 dark:border-secondary-800 pb-2">
            <Truck className="w-5 h-5 text-secondary-400" /> Shipping Configuration
          </h3>
          <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-xl border border-secondary-200 dark:border-secondary-800">
            <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-1">Global Default Shipping Fee (GHS)</label>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-3">
              This amount is charged for products set to use "Default Shipping". Free shipping is 0, and Custom Shipping overrides this.
            </p>
            <input
              type="number"
              step="0.01"
              required
              value={defaultShippingFee}
              onChange={(e) => setDefaultShippingFee(e.target.value)}
              className="w-full p-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;
