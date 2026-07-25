import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import adminService from '../../api/client'; // direct client helper
import DotPagination from '../../components/DotPagination';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, student_approvals
  const [page, setPage] = useState(1);
  const [studPage, setStudPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalStudPages = Math.ceil(pendingStudents.length / itemsPerPage);
  const paginatedStudents = pendingStudents.slice((studPage - 1) * itemsPerPage, studPage * itemsPerPage);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const res = await adminService.get('/admin/users');
        setUsers(res.data?.data || res.data || []);
      } else {
        const res = await adminService.get('/admin/users/student-verifications/pending');
        setPendingStudents(res.data?.data || res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleToggleStatus = async (uuid) => {
    try {
      await adminService.post(`/admin/users/${uuid}/toggle-status`);
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'User status updated successfully.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response?.data?.message || e.message || 'Failed to update user status.',
      });
    }
  };

  const handleApproveStudent = async (uuid, status) => {
    try {
      await adminService.post(`/admin/users/${uuid}/approve-student-verification`, { status });
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Student ID has been ${status}.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response?.data?.message || e.message || 'Failed to process student verification.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">User Accounts</h2>
          <p className="text-sm text-secondary-500 mt-1">Review customer profiles and toggle account security locks.</p>
        </div>
        <div className="flex border border-secondary-200 dark:border-secondary-800 rounded-lg p-1 bg-white dark:bg-secondary-900">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'all' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'}`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('student_approvals')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'student_approvals' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'}`}
          >
            Student Approvals
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : activeTab === 'all' ? (
        users.length === 0 ? (
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
                {paginatedUsers.map((u) => (
                  <tr key={u.id || u.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">{u.first_name} {u.last_name}</td>
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
            <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )
      ) : (
        pendingStudents.length === 0 ? (
          <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
            No pending student verifications.
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {paginatedStudents.map((u) => (
                  <tr key={u.id || u.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">{u.first_name} {u.last_name}</td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-300">{u.email}</td>
                    <td className="p-4 font-mono font-bold text-secondary-700 dark:text-secondary-300">{u.student_id}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveStudent(u.uuid, 'approved')}
                          className="px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleApproveStudent(u.uuid, 'rejected')}
                          className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <DotPagination currentPage={studPage} totalPages={totalStudPages} onPageChange={setStudPage} />
          </div>
        )
      )}
    </div>
  );
};

export default Users;
export { Users };
