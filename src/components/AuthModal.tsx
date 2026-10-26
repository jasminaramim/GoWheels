import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { X, Lock, Mail, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, openAuthModal, closeAuthModal, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Password reset state
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devTokenNotice, setDevTokenNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await register(name, email, password, phone);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccessMessage(res.message || 'Verification token sent.');
      if (res.devToken) {
        setDevTokenNotice(res.devToken);
        setResetToken(res.devToken);
      }
      setResetStep('verify');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token: resetToken, newPassword }),
      });
      setSuccessMessage('Password reset successfully! Please sign in with your new credentials.');
      setTimeout(() => {
        openAuthModal('login');
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setEmail('jasmin');
    setPassword('jasmin1142005');
    setErrorMessage('');
  };

  const quickFillCustomer = () => {
    setEmail('customer@gowheels.com');
    setPassword('Customer@12345');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
              GoWheels Account
            </div>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">
              {authModalTab === 'login'
                ? 'Sign In to Your Account'
                : authModalTab === 'register'
                ? 'Create Customer Account'
                : 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Credentials Helper Pill */}
        {authModalTab === 'login' && (
          <div className="bg-gray-50 px-6 py-2.5 border-b border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-medium">Quick Demo Credentials:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={quickFillAdmin}
                className="font-bold text-[#D71920] hover:underline"
              >
                Admin
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={quickFillCustomer}
                className="font-bold text-gray-800 hover:underline"
              >
                Customer
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Error / Success Notifications */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: Login */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Username or Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. jasmin or customer@gowheels.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[#D71920] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] disabled:opacity-60 rounded-xl transition-all shadow-md mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="text-center text-xs text-gray-500 pt-2">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="font-bold text-[#D71920] hover:underline"
                >
                  Register Now
                </button>
              </div>
            </form>
          )}

          {/* Form: Register */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. tanvir@example.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+880 1711-XXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] disabled:opacity-60 rounded-xl transition-all shadow-md mt-2"
              >
                {loading ? 'Creating Account...' : 'Register Customer Account'}
              </button>

              <div className="text-center text-xs text-gray-500 pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-bold text-[#D71920] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* Form: Forgot / Reset Password */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4 text-xs">
              {resetStep === 'request' ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <p className="text-gray-600">
                    Enter the email registered with your GoWheels account. We will issue a verification code to reset your password.
                  </p>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. customer@gowheels.com"
                      className="w-full p-2.5 border border-gray-200 rounded-xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl shadow-xs"
                  >
                    {loading ? 'Sending Code...' : 'Request Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {devTokenNotice && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
                      <strong>Verification Token:</strong> <span className="font-mono">{devTokenNotice}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Verification Token
                    </label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      placeholder="6-digit token"
                      className="w-full p-2.5 border border-gray-200 rounded-xl font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full p-2.5 border border-gray-200 rounded-xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl shadow-xs"
                  >
                    {loading ? 'Resetting...' : 'Set New Password'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-bold text-gray-600 hover:text-black"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
