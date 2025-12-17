/**
 * 👤 User Profile Page
 * Edit name, email, company, phone + change password
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/config/supabase';
import { User, Lock, Building2, Phone, Mail, Shield, Crown, Zap, Calendar, Award } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  plan: 'free' | 'starter' | 'pro';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'expired';
  license_key: string | null;
  invoices_created: number;
  invoices_limit: number;
  companies_limit: number;
  created_at: string;
}

export default function Profile() {
  const { user, loading: authLoading, updateProfile, updatePassword, signOut } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setCompanyName(data.company_name || '');
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        full_name: fullName,
        company_name: companyName,
        phone: phone,
      });

      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
      fetchProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChanging(true);
    setMessage(null);

    // Validation
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setPasswordChanging(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setPasswordChanging(false);
      return;
    }

    try {
      await updatePassword(newPassword);

      setMessage({ type: 'success', text: '✅ Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: `Failed to change password: ${error.message}` });
    } finally {
      setPasswordChanging(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Zap className="w-5 h-5 text-gray-400" />;
      case 'starter': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'pro': return <Crown className="w-5 h-5 text-yellow-500" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'starter': return 'bg-blue-100 text-blue-700';
      case 'pro': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Not logged in</h2>
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account information</p>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Subscription Status Card */}
      {profile && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getPlanIcon(profile.plan)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getPlanColor(profile.plan)}`}>
                  {profile.plan}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.subscription_status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {profile.subscription_status}
                </span>
              </div>

              {profile.license_key && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">License Key:</span>
                  </div>
                  <code className="text-sm font-mono text-gray-800">{profile.license_key}</code>
                </div>
              )}

              {profile.plan === 'free' && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📄 Invoices: {profile.invoices_created} / {profile.invoices_limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(profile.invoices_created / profile.invoices_limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {profile.plan === 'free' && (
              <a
                href="/pricing"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Upgrade Plan
              </a>
            )}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="MessuBouw B.V."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+31 6 12345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={passwordChanging}
            className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordChanging ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      {profile && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Account Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📅 Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
            <p>🏢 Companies limit: {profile.companies_limit === 999 ? 'Unlimited' : profile.companies_limit}</p>
            {profile.plan !== 'free' && (
              <p>📄 Invoices: Unlimited</p>
            )}
          </div>
        </div>
      )}

      {/* Support */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-700 mb-3">
          Contact our support team for assistance with your account.
        </p>
        <a
          href="mailto:info.messubouw@gmail.com"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Mail className="w-4 h-4" />
          info.messubouw@gmail.com
        </a>
      </div>
    </div>
  );
}
