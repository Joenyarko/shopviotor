import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import adminService from '../../api/client'; // direct client helper
import DotPagination from '../../components/DotPagination';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, student_approvals
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '', 'customer', 'vendor', 'admin'
  const [page, setPage] = useState(1);
  const [studPage, setStudPage] = useState(1);
  const perPage = 10;
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [studMeta, setStudMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [counts, setCounts] = useState({ total: 0, customers: 0, vendors: 0, admins: 0 });

  // Debounce search input so we don't spam the server on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
      setStudPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when role filter changes
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const params = {
          page,
          per_page: perPage,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (roleFilter) params.role = roleFilter;

        const res = await adminService.get('/admin/users', { params });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res)
              ? res
              : [];
        setUsers(list);

        if (res?.meta) {
          setMeta(res.meta);
        } else if (res?.data?.meta) {
          setMeta(res.data.meta);
        }

        if (res?.counts) {
          setCounts(res.counts);
        }
      } else {
        const params = {
          page: studPage,
          per_page: perPage,
        };
        const res = await adminService.get('/admin/users/student-verifications/pending', { params });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res)
              ? res
              : [];
        setPendingStudents(list);

        if (res?.meta) {
          setStudMeta(res.meta);
        } else if (res?.data?.meta) {
          setStudMeta(res.data.meta);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, page, studPage, roleFilter, debouncedSearch]);

  const handleRoleChange = async (uuid, newRole) => {
    try {
      await adminService.post(`/admin/users/${uuid}/role`, { role: newRole });
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Role Updated',
        text: `User role has been updated to ${newRole}.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response?.data?.message || e.message || 'Failed to update user role.',
      });
    }
  };

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

  const handleDelete = async (uuid) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! The user and all their data will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await adminService.delete(`/admin/users/${uuid}`);
        fetchUsers();
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      } catch (e) {
        Swal.fire('Error', e.response?.data?.message || e.message || 'Failed to delete user.', 'error');
      }
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

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl leading-5 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors shadow-sm"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'all' && (
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-900 text-sm font-semibold text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
            >
              <option value="">All Roles ({counts.total || meta.total || users.length})</option>
              <option value="customer">Customers ({counts.customers})</option>
              <option value="vendor">Vendors ({counts.vendors})</option>
              <option value="admin">Admins ({counts.admins})</option>
            </select>
            {roleFilter && (
              <button
                onClick={() => setRoleFilter('')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline px-1"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : activeTab === 'all' ? (
        users.length === 0 ? (
          <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
            {roleFilter || debouncedSearch ? 'No users match your filter criteria.' : 'No users found.'}
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[650px] text-left border-collapse text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {users.map((u) => (
                  <tr key={u.id || u.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">{u.first_name} {u.last_name}</td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-300">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role || 'customer'}
                        onChange={(e) => handleRoleChange(u.id || u.uuid, e.target.value)}
                        className="text-xs font-bold px-2 py-1 rounded bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 border border-secondary-200 dark:border-secondary-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-xxs px-2 py-0.5 rounded-full font-bold uppercase ${u.is_active ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400' : 'bg-accent-100 dark:bg-accent-950/20 text-accent-800 dark:text-accent-400'}`}>
                        {u.is_active ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u.id || u.uuid)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center min-w-[80px] ${u.is_active ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/20 border-accent-200 dark:border-accent-800' : 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800'}`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id || u.uuid)}
                          className="p-1.5 rounded-lg border text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-secondary-200 dark:border-secondary-800 text-xs text-secondary-500 gap-2">
              <span>Showing page <strong className="text-secondary-900 dark:text-white">{meta.current_page || 1}</strong> of <strong className="text-secondary-900 dark:text-white">{meta.last_page || 1}</strong> ({meta.total || users.length} total accounts)</span>
              <DotPagination currentPage={page} totalPages={meta.last_page || 1} onPageChange={setPage} />
            </div>
          </div>
        )
      ) : (
        pendingStudents.length === 0 ? (
          <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
            No pending student verifications.
          </div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[650px] text-left border-collapse text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                  <th className="p-4">Account</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Course & Level</th>
                  <th className="p-4">ID Picture</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {pendingStudents.map((u) => (
                  <tr key={u.id || u.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4 text-secondary-600 dark:text-secondary-300">
                      <div className="font-semibold text-secondary-900 dark:text-white">{u.first_name} {u.last_name}</div>
                      <div className="text-xs">{u.email}</div>
                    </td>
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">{u.student_name || 'N/A'}</td>
                    <td className="p-4 font-mono font-bold text-secondary-700 dark:text-secondary-300">{u.student_id}</td>
                    <td className="p-4 text-sm">
                      <div className="font-semibold text-secondary-900 dark:text-white">{u.student_course || 'N/A'}</div>
                      <div className="text-xs text-secondary-500">{u.student_level || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      {u.student_id_picture_url ? (
                        <a href={`http://localhost:8000${u.student_id_picture_url}`} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs font-bold flex items-center gap-1">
                          View Image
                        </a>
                      ) : (
                        <span className="text-xs text-secondary-500">No Image</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveStudent(u.id || u.uuid, 'approved')}
                          className="px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleApproveStudent(u.id || u.uuid, 'rejected')}
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
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-secondary-200 dark:border-secondary-800 text-xs text-secondary-500 gap-2">
              <span>Showing page <strong className="text-secondary-900 dark:text-white">{studMeta.current_page || 1}</strong> of <strong className="text-secondary-900 dark:text-white">{studMeta.last_page || 1}</strong> ({studMeta.total || pendingStudents.length} pending)</span>
              <DotPagination currentPage={studPage} totalPages={studMeta.last_page || 1} onPageChange={setStudPage} />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Users;
export { Users };
