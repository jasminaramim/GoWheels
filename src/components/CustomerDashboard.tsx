import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest, formatCurrency, formatDate } from '../lib/api.ts';
import { IBooking, INotification } from '../server/models/types.ts';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  KeyRound,
  Bell,
  ArrowRight,
  LogOut,
  Car,
  MapPin,
  X,
} from 'lucide-react';

export const CustomerDashboard: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'password' | 'notifications'>('bookings');

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  // Cancellation modal
  const [cancelModalBooking, setCancelModalBooking] = useState<IBooking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Profile edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Password edit
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await apiRequest<IBooking[]>('/bookings/my');
      if (res.data) {
        setBookings(res.data);
      }
    } catch {
      // ignore
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest<INotification[]>('/notifications');
      if (res.data) setNotifications(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    try {
      await apiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone }),
      });
      await refreshUser();
      setProfileMessage('Profile updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      setProfileMessage(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', isError: true });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      await apiRequest('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordMessage({ text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing password';
      setPasswordMessage({ text: msg, isError: true });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking || !cancelReason.trim()) return;
    setCancelSubmitting(true);
    try {
      await apiRequest(`/bookings/${cancelModalBooking._id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setCancelModalBooking(null);
      setCancelReason('');
      fetchBookings();
      fetchNotifications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit cancellation');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'pending':
        return <span className="text-amber-700 font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending Review</span>;
      case 'completed':
        return <span className="text-blue-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'cancellation_requested':
        return <span className="text-orange-700 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Cancellation Pending</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="text-red-700 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {status.toUpperCase()}</span>;
      default:
        return <span className="text-gray-700 font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Strip */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
            Customer Dashboard
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your car rentals, booking confirmations, and personal profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            Browse Fleet
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Functional Segmented Control) */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Notifications
          {notifications.filter(n => !n.readAt).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#D71920]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'password'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Tab: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {bookingsLoading ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-4">
              <Car className="w-12 h-12 text-gray-300 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">No Bookings Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  You haven&apos;t requested any car rentals yet. Browse our verified fleet and book your first journey.
                </p>
              </div>
              <button
                onClick={onNavigateHome}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl shadow-xs"
              >
                Find A Car
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map(b => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {b.bookingNumber}
                      </span>
                      <span aria-hidden="true" className="text-gray-300">·</span>
                      <span className="text-xs">{getStatusBadge(b.bookingStatus)}</span>
                      <span aria-hidden="true" className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">
                        Requested {formatDate(b.createdAt)}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{b.pickupLocation}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <span>{b.returnLocation}</span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                      <span>Pickup: {formatDate(b.pickupAt)}</span>
                      <span>·</span>
                      <span>Return: {formatDate(b.returnAt)} ({b.rentalDuration} Days)</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 gap-3">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        Total Amount ({b.paymentStatus})
                      </div>
                      <div className="font-mono text-base font-black text-gray-900">
                        {formatCurrency(b.priceBreakdown.totalAmount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Receipt & Details
                      </button>

                      {['pending', 'approved', 'confirmed'].includes(b.bookingStatus) && (
                        <button
                          onClick={() => {
                            setCancelModalBooking(b);
                            setCancelReason('');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Recent System & Booking Alerts
          </h3>
          {notifications.length === 0 ? (
            <div className="text-xs text-gray-500 py-6 text-center">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(n => (
                <div
                  key={n._id}
                  className={`py-3.5 flex items-start justify-between gap-4 ${
                    !n.readAt ? 'bg-red-50/30 -mx-4 px-4 rounded-xl' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{n.title}</span>
                      {!n.readAt && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <div className="text-[10px] text-gray-400">{formatDate(n.createdAt)}</div>
                  </div>

                  {!n.readAt && (
                    <button
                      onClick={() => markNotificationRead(n._id)}
                      className="text-xs font-bold text-[#D71920] hover:underline shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Account Information
          </h3>

          {profileMessage && (
            <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400">Email address cannot be changed directly</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl transition-all shadow-xs"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Password */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Security & Password Update
          </h3>

          {passwordMessage && (
            <div
              className={`p-3 mb-4 text-xs rounded-xl border font-semibold ${
                passwordMessage.isError
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl transition-all shadow-xs"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="text-[11px] font-bold text-[#D71920] uppercase">Official Reservation</div>
                <h3 className="text-lg font-black text-gray-900">{selectedBooking.bookingNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Status</span>
                <span>{getStatusBadge(selectedBooking.bookingStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <span className="font-bold text-gray-900 uppercase">{selectedBooking.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup Date</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedBooking.pickupAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Return Date</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedBooking.returnAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Locations</span>
                <span className="font-semibold text-gray-900 text-right">
                  {selectedBooking.pickupLocation} → {selectedBooking.returnLocation}
                </span>
              </div>
              {selectedBooking.customerNotes && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-bold text-gray-700">Trip Requests:</div>
                  <div className="text-gray-600 mt-0.5">{selectedBooking.customerNotes}</div>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
              <div className="font-bold text-gray-900 mb-1">Price Snapshot</div>
              <div className="flex justify-between text-gray-600">
                <span>Base ({selectedBooking.rentalDuration} Days)</span>
                <span className="font-mono">{formatCurrency(selectedBooking.priceBreakdown.baseTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Fee</span>
                <span className="font-mono">{formatCurrency(selectedBooking.priceBreakdown.serviceFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (5%)</span>
                <span className="font-mono">{formatCurrency(selectedBooking.priceBreakdown.tax)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-sm text-gray-900">
                <span>Total Amount</span>
                <span className="font-mono text-[#D71920]">
                  {formatCurrency(selectedBooking.priceBreakdown.totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Request Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Cancel Booking #{cancelModalBooking.bookingNumber}
              </h3>
              <button onClick={() => setCancelModalBooking(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please let us know the reason for your cancellation. If approved, any paid deposits will be processed according to our transparent policy.
            </p>

            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule change, flight postponed..."
              rows={3}
              className="w-full p-3 text-xs border border-gray-200 rounded-xl"
              required
            />

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelSubmitting || cancelReason.trim().length < 5}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                {cancelSubmitting ? 'Submitting...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
