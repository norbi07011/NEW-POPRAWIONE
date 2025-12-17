/**
 * 🔐 Login & Signup Page
 * Simple authentication forms for testing
 */
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        setMessage({ type: 'success', text: '✅ Login successful! Redirecting...' });
        
        // Redirect to profile page after 1 second
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        // Validation
        if (!fullName.trim()) {
          setMessage({ type: 'error', text: 'Full name is required' });
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
          setLoading(false);
          return;
        }

        await signUp(email, password, fullName);
        setMessage({
          type: 'success',
          text: '✅ Account created! Check your email to confirm (or auto-confirmed if enabled)',
        });

        // Auto-switch to login mode after 2 seconds
        setTimeout(() => {
          setMode('login');
          setPassword('');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // User-friendly error messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Email already registered. Try logging in.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account';
      } else {
        errorMessage = error.message;
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login'
              ? 'Sign in to access your account'
              : 'Sign up to get started with MessuBouw'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Signup only) */}
            {mode === 'signup' && (
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Test Credentials (Development only) */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 mb-2">🧪 Test Credentials:</p>
          <p className="text-xs text-yellow-700">Email: test@messubouw.com</p>
          <p className="text-xs text-yellow-700">Password: testpass123</p>
          <p className="text-xs text-yellow-600 mt-2">
            (Create this user in Supabase Dashboard first)
          </p>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a
              href="mailto:info.messubouw@gmail.com"
              className="text-blue-600 hover:text-blue-700"
            >
              info.messubouw@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
