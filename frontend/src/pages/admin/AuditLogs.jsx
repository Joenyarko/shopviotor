import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Filter, Calendar, User, 
  Database, Clock, Eye, AlertCircle 
} from 'lucide-react';
import { auditService } from '../../services/auditService';
import { toast } from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page) => {
    try {
      setLoading(true);
      const res = await auditService.getLogs({ per_page: 20, page });
      setLogs(res.data);
      setMeta(res.meta);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'updated': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'deleted': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const formatModelName = (modelPath) => {
    if (!modelPath) return 'Unknown';
    const parts = modelPath.split('\\');
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            System Audit Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitor and track all critical changes across the platform.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module (Record ID)</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {formatModelName(log.subject_type)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ID: {log.subject_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System / Guest'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetails(log)}
                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                        title="View Changes"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing page {meta.current_page} of {meta.last_page} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 text-sm font-medium dark:text-white"
              >
                Prev
              </button>
              <button
                disabled={currentPage === meta.last_page}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 text-sm font-medium dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Diff Modal */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  {formatModelName(selectedLog.subject_type)} Record Change
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  ID: {selectedLog.subject_id} &bull; Action: <span className="uppercase font-bold text-slate-700 dark:text-slate-300">{selectedLog.action}</span>
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-200 dark:bg-slate-700 p-2 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {(!selectedLog.old_values && !selectedLog.new_values) ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                  <p>No payload data recorded for this action.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OLD VALUES */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase text-xs tracking-wider">Before (Old Values)</h4>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-800">
                      <pre className="text-rose-400 text-sm font-mono leading-relaxed">
                        {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>

                  {/* NEW VALUES */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-xs tracking-wider">After (New Values)</h4>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-800">
                      <pre className="text-emerald-400 text-sm font-mono leading-relaxed">
                        {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
