import React, { useState } from 'react';
useTheme
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';

const Settings = () => {
  const [siteName, setSiteName] = useState('VTE Marketplace');
  const [momoTax, setMomoTax] = useState('1.0');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      alert('Global settings saved successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary-500" /> Platform Settings
        </h2>
        <p className="text-sm text-secondary-500 mt-1">Configure global application variables, taxes, and service status.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-secondary-500 uppercase">Store / Site Name</label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-secondary-500 uppercase">Momo Service Surcharge (%)</label>
          <input
            type="number"
            step="0.1"
            required
            value={momoTax}
            onChange={(e) => setMomoTax(e.target.value)}
            className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Settings
        </button>
      </form>
    </div>
  );
};

// Simple unused import cleanup
import { useTheme } from '../../contexts/ThemeContext';

export default Settings;
export { Settings };
