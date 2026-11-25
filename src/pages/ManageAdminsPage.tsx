import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminAccount } from '../types';

export const ManageAdminsPage: React.FC = () => {
  const {
    currentUser,
    loginAsAdmin,
    adminAccounts,
    addAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    refreshAdminAccounts,
  } = useApp();

  // Admin gate login state if user visits /admin/manage-admins directly while logged out
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Create form state (inline, always visible right at top)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Co-Administrator');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit / password reset state
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation state
  const [deletingAdmin, setDeletingAdmin] = useState<AdminAccount | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    const handleGateLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      if (!loginPass.trim()) {
        setLoginError('Please enter your administrator password or passcode.');
        return;
      }
      setIsLoggingIn(true);
      try {
        const ok = await loginAsAdmin(loginPass.trim(), loginIdentifier.trim() || undefined);
        if (!ok) {
          setLoginError('Access Denied: Incorrect credentials or suspended account.');
        }
      } finally {
        setIsLoggingIn(false);
      }
    };

    return (
      <div className="py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-[#12315A] text-white p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">Administrator Verification</h2>
            <p className="text-xs text-blue-200">Sign in to add or manage administrators</p>
          </div>
          <form onSubmit={handleGateLogin} className="p-7 space-y-4 text-xs sm:text-sm">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {loginError}
              </div>
            )}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Username, Email, or Mobile (Optional for Main Admin)
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="admin, email, or mobile number"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password / Passcode *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  placeholder="Enter administrator password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const res = await addAdminAccount({
        name,
        username,
        email,
        phone,
        designation,
        password,
        active: true,
      });
      if (!res.success) {
        setFormError(res.error || 'Could not create admin account.');
        return;
      }
      setToast(
        `Added full-access admin "${name.trim()}" (Username: ${username.trim().toLowerCase()}). They can sign in immediately with full upload, edit, and delete permissions.`
      );
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setDesignation('Co-Administrator');
      setPassword('');
      setTimeout(() => setToast(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (acc: AdminAccount) => {
    setEditingAdmin(acc);
    setEditName(acc.name);
    setEditUsername(acc.username);
    setEditEmail(acc.email);
    setEditPhone(acc.phone || '');
    setEditDesignation(acc.designation || 'Co-Administrator');
    setEditNewPassword('');
    setShowEditPassword(false);
    setEditActive(acc.active);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditError(null);
    setIsUpdating(true);
    try {
      const res = await updateAdminAccount(editingAdmin.id, {
        name: editName,
        username: editUsername,
        email: editEmail,
        phone: editPhone,
        designation: editDesignation,
        active: editActive,
        newPassword: editNewPassword || undefined,
      });
      if (!res.success) {
        setEditError(res.error || 'Failed to update admin account.');
        return;
      }
      setToast(`Updated administrator details for ${editName.trim()}.`);
      setEditingAdmin(null);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12315A] text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Manage Multiple Full-Access Admins</h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Signed in as <strong>{currentUser.name}</strong> • Every active admin can upload, edit &amp; delete anything on the site.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={async () => {
              setIsRefreshing(true);
              try {
                const res = await refreshAdminAccounts();
                setToast(
                  res.error
                    ? res.error
                    : `Synced ${res.count} co-admin account${res.count === 1 ? '' : 's'} from cloud.`
                );
                setTimeout(() => setToast(null), 4000);
              } finally {
                setIsRefreshing(false);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INLINE ADD NEW ADMIN FORM (ALWAYS VISIBLE) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#12315A]">Add New Full-Access Administrator</h2>
            <p className="text-xs text-slate-500">
              Create login credentials for another admin. They get full rights to upload, edit, evaluate, and delete everything.
            </p>
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Adhikari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Login Username *</label>
            <input
              type="text"
              required
              placeholder="e.g. ramesh.admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Email *</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@shikshyalaya.edu.np"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. 98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Designation / Role</label>
            <input
              type="text"
              placeholder="e.g. Academic Coordinator"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Login Password * (min 6 chars)</label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#12315A] hover:bg-blue-900 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>{isSaving ? 'Creating Admin...' : 'Create Full-Access Admin Account'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* EXISTING ADMIN ACCOUNTS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#12315A] flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Authorized Administrators ({adminAccounts.length + 1})</span>
          </h3>
        </div>

        {/* Built-in Primary Super Admin */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">Primary Super Admin</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                Root Account
              </span>
              {currentUser.id === 'admin-1' && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Currently Signed In
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-1">
              Username: <code className="font-mono font-bold">admin</code> • Email:{' '}
              <code className="font-mono">admin@shikshyalaya.edu.np</code>
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">Always Active • Full Access</span>
        </div>

        {adminAccounts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-200 rounded-2xl">
            No extra co-admins added yet. Use the form above to add your first co-admin.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminAccounts.map((acc) => {
              const isSelf = currentUser.id === acc.id;
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl border border-slate-200 space-y-3 text-xs bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{acc.name}</span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                            You
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            acc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {acc.active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                      <p className="text-blue-700 font-semibold mt-0.5">
                        {acc.designation || 'Co-Administrator'} • Full Access
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-slate-600">
                    <div>
                      Username: <code className="font-mono font-bold text-slate-900">{acc.username}</code>
                    </div>
                    <div>
                      Email: <span className="text-slate-900">{acc.email}</span>
                    </div>
                    {acc.phone && (
                      <div>
                        Mobile: <span className="font-mono text-slate-900">{acc.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openEditModal(acc)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit / Password</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={async () => {
                        const res = await updateAdminAccount(acc.id, { active: !acc.active });
                        if (res.success) {
                          setToast(`${acc.name} is now ${!acc.active ? 'Active' : 'Suspended'}.`);
                          setTimeout(() => setToast(null), 3500);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold cursor-pointer disabled:opacity-40"
                    >
                      {acc.active ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => setDeletingAdmin(acc)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingAdmin(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#12315A]">Edit Administrator</h3>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    minLength={editNewPassword ? 6 : undefined}
                    placeholder="Optional new password"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editActive}
                  disabled={currentUser.id === editingAdmin.id}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                <span>Active Full-Access Administrator</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#12315A] text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingAdmin(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-base text-[#12315A]">Delete Administrator?</h4>
            <p className="text-xs text-slate-600">
              Permanently remove <strong>{deletingAdmin.name}</strong> ({deletingAdmin.username})? They will no longer be able to log in as admin.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingAdmin(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deletingAdmin;
                  setDeletingAdmin(null);
                  const res = await deleteAdminAccount(target.id);
                  if (res.success) {
                    setToast(`Deleted admin account "${target.name}".`);
                    setTimeout(() => setToast(null), 4000);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
