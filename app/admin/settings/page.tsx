'use client';

import { useState, useEffect } from 'react';
import { StaffModal } from '@/components/admin/StaffModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { BrandingUploader } from '@/components/admin/BrandingUploader';
import type { StripeSettings, StripePaymentMethods } from '@/types';

interface StaffUser {
  id: string;
  email: string;
  role: 'admin' | 'operator';
  created_at: string;
}

interface BrandingSettings {
  logo_url: string | null;
  favicon_url: string | null;
}

export default function SettingsPage() {
  // Branding state
  const [branding, setBranding] = useState<BrandingSettings>({
    logo_url: null,
    favicon_url: null,
  });
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingError, setBrandingError] = useState<string | null>(null);
  const [brandingSuccess, setBrandingSuccess] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Staff management state
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffUser | null>(null);

  // Stripe settings state
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    mode: 'test',
    test_publishable_key: '',
    test_secret_key: '',
    live_publishable_key: '',
    live_secret_key: '',
    webhook_secret: '',
    payment_methods: {
      card: true,
      google_pay: true,
      apple_pay: true,
      promptpay: true,
    },
  });
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [showSecretKeys, setShowSecretKeys] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchBranding();
    fetchStaff();
    fetchStripeSettings();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/admin/settings/branding');
      const data = await response.json();
      if (data.success) {
        setBranding(data.data);
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setBrandingLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/settings/staff');
      const data = await response.json();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchStripeSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/stripe');
      const data = await response.json();
      if (data.success && data.data) {
        // Merge with defaults to ensure all fields exist
        setStripeSettings({
          mode: data.data.mode || 'test',
          test_publishable_key: data.data.test_publishable_key || '',
          test_secret_key: data.data.test_secret_key || '',
          live_publishable_key: data.data.live_publishable_key || '',
          live_secret_key: data.data.live_secret_key || '',
          webhook_secret: data.data.webhook_secret || '',
          payment_methods: {
            card: data.data.payment_methods?.card ?? true,
            google_pay: data.data.payment_methods?.google_pay ?? true,
            apple_pay: data.data.payment_methods?.apple_pay ?? true,
            promptpay: data.data.payment_methods?.promptpay ?? true,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching stripe settings:', error);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleStripeSave = async () => {
    setStripeSaving(true);
    setStripeError(null);
    setStripeSuccess(false);

    try {
      const response = await fetch('/api/admin/settings/stripe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save Stripe settings');
      }

      setStripeSuccess(true);
      setTimeout(() => setStripeSuccess(false), 3000);
      // Refresh to get masked keys
      fetchStripeSettings();
    } catch (error) {
      setStripeError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setStripeSaving(false);
    }
  };

  const handlePaymentMethodToggle = (method: keyof StripePaymentMethods) => {
    setStripeSettings((prev) => ({
      ...prev,
      payment_methods: {
        card: prev.payment_methods?.card ?? true,
        google_pay: prev.payment_methods?.google_pay ?? true,
        apple_pay: prev.payment_methods?.apple_pay ?? true,
        promptpay: prev.payment_methods?.promptpay ?? true,
        [method]: !(prev.payment_methods?.[method] ?? true),
      },
    }));
  };

  // Branding save handler
  const handleBrandingSave = async () => {
    setBrandingSaving(true);
    setBrandingError(null);
    setBrandingSuccess(false);

    try {
      const response = await fetch('/api/admin/settings/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save branding');
      }

      setBrandingSuccess(true);
      setTimeout(() => setBrandingSuccess(false), 3000);
    } catch (error) {
      setBrandingError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setBrandingSaving(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/admin/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Staff handlers
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setStaffModalOpen(true);
  };

  const handleEditStaff = (staffMember: StaffUser) => {
    setSelectedStaff(staffMember);
    setStaffModalOpen(true);
  };

  const handleDeleteClick = (staffMember: StaffUser) => {
    setStaffToDelete(staffMember);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    try {
      const response = await fetch(`/api/admin/settings/staff/${staffToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStaff(staff.filter(s => s.id !== staffToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    } finally {
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your site branding, account, and staff members
        </p>
      </div>

      {/* Branding Section */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Site Branding</h2>
              <p className="text-sm text-gray-500">Customize your website logo and favicon</p>
            </div>
          </div>

          {brandingLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {brandingError && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {brandingError}
                </div>
              )}

              {brandingSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">
                  Branding settings saved successfully!
                </div>
              )}

              <div className="grid gap-8 md:grid-cols-2">
                {/* Logo Upload */}
                <BrandingUploader
                  value={branding.logo_url}
                  onChange={(url) => setBranding({ ...branding, logo_url: url })}
                  label="Website Logo"
                  type="logo"
                  description="This logo will appear in the header of your website"
                />

                {/* Favicon Upload */}
                <BrandingUploader
                  value={branding.favicon_url}
                  onChange={(url) => setBranding({ ...branding, favicon_url: url })}
                  label="Favicon"
                  type="favicon"
                  description="This icon appears in browser tabs and bookmarks"
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleBrandingSave}
                  disabled={brandingSaving}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {brandingSaving ? 'Saving...' : 'Save Branding'}
                </button>
                
                {/* Preview Note */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span>Note: Logo and favicon are stored as mock URLs for now (bucket not configured)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            {passwordError && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
                Password changed successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
                minLength={6}
              />
              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Password strength: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Staff Management Section */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Staff Management</h2>
                <p className="text-sm text-gray-500">Add and manage staff members</p>
              </div>
            </div>
            <button
              onClick={handleAddStaff}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Staff
            </button>
          </div>

          {/* Staff Table */}
          {staffLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
                <svg className="size-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="mt-4 font-semibold text-gray-700">No staff members</p>
              <p className="mt-1 text-sm text-gray-500">Add your first staff member to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Added
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{member.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditStaff(member)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Edit"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Gateway Section */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Payment Gateway</h2>
              <p className="text-sm text-gray-500">Configure Stripe payment settings</p>
            </div>
          </div>

          {stripeLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {stripeError && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {stripeError}
                </div>
              )}

              {stripeSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">
                  Stripe settings saved successfully!
                </div>
              )}

              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Environment Mode</h3>
                      <p className="text-sm text-gray-500">
                        {stripeSettings.mode === 'test' 
                          ? 'Using test keys - no real charges will be made'
                          : 'Using live keys - real charges will be processed'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${stripeSettings.mode === 'test' ? 'text-amber-600' : 'text-gray-400'}`}>
                        Test
                      </span>
                      <button
                        type="button"
                        onClick={() => setStripeSettings({ ...stripeSettings, mode: stripeSettings.mode === 'test' ? 'live' : 'test' })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          stripeSettings.mode === 'live' ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            stripeSettings.mode === 'live' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${stripeSettings.mode === 'live' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        Live
                      </span>
                    </div>
                  </div>
                  {stripeSettings.mode === 'live' && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                      <svg className="size-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Live mode is active. Real payments will be processed.</span>
                    </div>
                  )}
                </div>

                {/* API Keys */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Test Keys */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Test Mode
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Publishable Key
                      </label>
                      <input
                        type="text"
                        value={stripeSettings.test_publishable_key}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, test_publishable_key: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecretKeys ? 'text' : 'password'}
                          value={stripeSettings.test_secret_key}
                          onChange={(e) => setStripeSettings({ ...stripeSettings, test_secret_key: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          placeholder="sk_test_..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretKeys(!showSecretKeys)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecretKeys ? (
                            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Keys */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Live Mode
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Publishable Key
                      </label>
                      <input
                        type="text"
                        value={stripeSettings.live_publishable_key}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, live_publishable_key: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecretKeys ? 'text' : 'password'}
                          value={stripeSettings.live_secret_key}
                          onChange={(e) => setStripeSettings({ ...stripeSettings, live_secret_key: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          placeholder="sk_live_..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    type={showSecretKeys ? 'text' : 'password'}
                    value={stripeSettings.webhook_secret}
                    onChange={(e) => setStripeSettings({ ...stripeSettings, webhook_secret: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="whsec_..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Configure your webhook endpoint at: <code className="rounded bg-gray-100 px-1 py-0.5">{typeof window !== 'undefined' ? window.location.origin : ''}/api/stripe/webhook</code>
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Enabled Payment Methods</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Card */}
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={stripeSettings.payment_methods.card}
                        onChange={() => handlePaymentMethodToggle('card')}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <svg className="size-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Credit/Debit Card</p>
                          <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                        </div>
                      </div>
                    </label>

                    {/* Google Pay */}
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={stripeSettings.payment_methods.google_pay}
                        onChange={() => handlePaymentMethodToggle('google_pay')}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <svg className="size-6" viewBox="0 0 24 24" fill="none">
                          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Google Pay</p>
                          <p className="text-xs text-gray-500">Fast checkout with Google</p>
                        </div>
                      </div>
                    </label>

                    {/* Apple Pay */}
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={stripeSettings.payment_methods.apple_pay}
                        onChange={() => handlePaymentMethodToggle('apple_pay')}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Apple Pay</p>
                          <p className="text-xs text-gray-500">Fast checkout with Apple</p>
                        </div>
                      </div>
                    </label>

                    {/* PromptPay (Thai QR) */}
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={stripeSettings.payment_methods.promptpay}
                        onChange={() => handlePaymentMethodToggle('promptpay')}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <svg className="size-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 2v2h2V7H7zm4 0v2h2V7h-2zm4 0v2h2V7h-2zM7 11v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM7 15v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"/>
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Thai QR (PromptPay)</p>
                          <p className="text-xs text-gray-500">Scan & pay with Thai banks</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStripeSave}
                    disabled={stripeSaving}
                    className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {stripeSaving ? 'Saving...' : 'Save Payment Settings'}
                  </button>
                  
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Get API keys from Stripe
                    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => {
          setStaffModalOpen(false);
          setSelectedStaff(null);
        }}
        onSave={fetchStaff}
        staff={selectedStaff}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Staff Member"
        message={`Are you sure you want to remove ${staffToDelete?.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setStaffToDelete(null);
        }}
      />
    </div>
  );
}


