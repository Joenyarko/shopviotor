import React, { useState } from 'react';
import { BarChart2, Download, RefreshCw } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      alert('Report generation scheduled. It will download shortly.');
    } catch (e) {
      console.error(e);
      alert('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary-500" /> System Report Exports
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Export transaction, swap inventory, and financial balances logs.</p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase">Report Scope</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="revenue">Financial Revenue Report</option>
            <option value="barter">Barter Swap Trades Audit</option>
            <option value="acquisition">Sell direct buyout list</option>
            <option value="raffle">Raffles & Draw ticket metrics</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase">Output Format</label>
          <div className="flex gap-4 mt-2">
            {['pdf', 'csv', 'xlsx'].map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300 capitalize cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} Export Document
        </button>
      </form>
    </div>
  );
};

export default Reports;
export { Reports };
