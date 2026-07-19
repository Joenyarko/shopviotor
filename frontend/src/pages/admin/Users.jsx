import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import adminService from '../../api/client'; // direct client helper

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.get('/admin/users');
      setUsers(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Fallback mockup
      setUsers([
        { id: 1, uuid: 'u1', name: 'John Doe', email: 'john@example.com', role: 'customer', is_active: true },
        { id: 2, uuid: 'u2', name: 'Admin Jane', email: 'jane@viotor.com', role: 'admin', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (uuid) => {
    try {
      await adminService.post(`/admin/users/${uuid}/toggle-status`);
      fetchUsers();
    } catch (e) {
      alert(e.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">User Accounts</h2>
        <p className="text-sm text-secondary-500 mt-1">Review customer profiles and toggle account security locks.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
          No users found.
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Failsafe Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {users.map((u) => (
                <tr key={u.id || u.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                  <td className="p-4 font-semibold text-secondary-900 dark:text-white">{u.name}</td>
                  <td className="p-4 text-secondary-600 dark:text-secondary-300">{u.email}</td>
                  <td className="p-4 capitalize"><span className="text-xxs font-bold px-2 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300">{u.role}</span></td>
                  <td className="p-4">
                    <span className={`text-xxs px-2 py-0.5 rounded-full font-bold uppercase ${u.is_active ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400' : 'bg-accent-100 dark:bg-accent-950/20 text-accent-800 dark:text-accent-400'}`}>
                      {u.is_active ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.uuid)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold ${u.is_active ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/20 border-accent-200 dark:border-accent-800' : 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800'}`}
                    >
                      {u.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
export { Users };
