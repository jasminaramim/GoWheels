import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest, formatCurrency, formatDate } from '../lib/api.ts';
import { ICar, IBooking, IUser } from '../server/models/types.ts';
import {
  Shield,
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Users,
  DollarSign,
  Download,
  Filter,
  Search,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'bookings' | 'customers' | 'reports'>('overview');

  // Overview analytics state
  interface AnalyticsData {
    overview: {
      totalCars: number;
      availableCars: number;
      totalBookings: number;
      pendingBookings: number;
      confirmedBookings: number;
      completedBookings: number;
      totalCustomers: number;
    };
    financials: {
      recordedRevenue: number;
      totalBookingValue: number;
      pendingPaymentAmount: number;
      currency: string;
    };
    statusDistribution: Record<string, number>;
    recentBookings: IBooking[];
  }

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cars Management State
  const [cars, setCars] = useState<ICar[]>([]);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ICar | null>(null);
  const [carForm, setCarForm] = useState({
    brand: '',
    model: '',
    year: 2024,
    description: '',
    category: 'Sedan' as const,
    dailyRate: 4500,
    transmission: 'Automatic' as const,
    fuelType: 'Hybrid' as const,
    seats: 5,
    location: 'Gulshan 2, Dhaka',
    images: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
    features: 'Apple CarPlay, AC, 360 Camera, Cruise Control',
    vehicleStatus: 'available' as const,
  });

  // Bookings Management State
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Customers State
  const [customers, setCustomers] = useState<IUser[]>([]);

  // Action status message
  const [actionNotice, setActionNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await apiRequest<AnalyticsData>('/admin/analytics');
      if (res.data) setAnalytics(res.data);
    } catch {
      // ignore
    }
  };

  const fetchCars = async () => {
    try {
      const res = await apiRequest<ICar[]>('/admin/cars');
      if (res.data) setCars(res.data);
    } catch {
      // ignore
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await apiRequest<IBooking[]>(
        `/admin/bookings?status=${bookingFilter}&search=${encodeURIComponent(bookingSearch)}`
      );
      if (res.data) setBookings(res.data);
    } catch {
      // ignore
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiRequest<IUser[]>('/admin/customers');
      if (res.data) setCustomers(res.data);
    } catch {
      // ignore
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchCars(), fetchBookings(), fetchCustomers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [bookingFilter, bookingSearch, activeTab]);

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: string,
    adminNotes?: string
  ) => {
    setActionNotice(null);
    try {
      await apiRequest(`/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      });
      setActionNotice({ text: `Booking updated to ${status.toUpperCase()}` });
      fetchBookings();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      setActionNotice({ text: msg, isError: true });
    }
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionNotice(null);
    try {
      const payload = {
        ...carForm,
        images: carForm.images.split('\n').map(s => s.trim()).filter(Boolean),
        features: carForm.features.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingCar) {
        await apiRequest(`/admin/cars/${editingCar._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setActionNotice({ text: 'Vehicle updated successfully' });
      } else {
        await apiRequest('/admin/cars', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setActionNotice({ text: 'Vehicle added to fleet successfully' });
      }

      setCarModalOpen(false);
      setEditingCar(null);
      fetchCars();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving car';
      setActionNotice({ text: msg, isError: true });
    }
  };

  const handleArchiveCar = async (carId: string) => {
    if (!confirm('Are you sure you want to archive this car? Historical bookings will remain intact.')) return;
    try {
      await apiRequest(`/admin/cars/${carId}`, { method: 'DELETE' });
      setActionNotice({ text: 'Vehicle archived safely' });
      fetchCars();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error archiving car';
      setActionNotice({ text: msg, isError: true });
    }
  };

  const handleToggleCustomerStatus = async (customerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await apiRequest(`/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      setActionNotice({ text: `Customer account ${newStatus}` });
      fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating customer';
      setActionNotice({ text: msg, isError: true });
    }
  };

  const exportBookingsCSV = () => {
    if (!bookings.length) return;
    const headers = ['Booking Number', 'Customer', 'Email', 'Vehicle', 'Pickup', 'Return', 'Days', 'Total (BDT)', 'Status', 'Payment'];
    const rows = bookings.map(b => [
      b.bookingNumber,
      b.customerName || 'N/A',
      b.customerEmail || 'N/A',
      b.carId,
      b.pickupLocation,
      b.returnLocation,
      b.rentalDuration,
      b.priceBreakdown.totalAmount,
      b.bookingStatus,
      b.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gowheels_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#D71920]" />
            GoWheels Management Console
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Administrator Portal</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fleet operations, reservation approvals, customer directory, and revenue reports.
          </p>
        </div>

        <button
          onClick={onNavigateHome}
          className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl"
        >
          View Live Website
        </button>
      </div>

      {/* Global Notice Banner */}
      {actionNotice && (
        <div
          className={`p-4 mb-6 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            actionNotice.isError
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs (Functional Segmented Control) */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'bookings' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('cars')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'cars' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fleet ({cars.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'customers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Revenue Reports
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          {/* Key KPI Metric Strip (Tabular Figures) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Fleet Capacity
              </div>
              <div className="text-2xl font-black text-gray-900 font-mono tabular-nums mt-1">
                {analytics.overview.availableCars}
                <span className="text-xs font-sans text-gray-400 font-normal ml-1">
                  / {analytics.overview.totalCars} Available
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Pending Approvals
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-1">
                {analytics.overview.pendingBookings}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Recorded Revenue (Paid)
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">
                {formatCurrency(analytics.financials.recordedRevenue)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Booking Pipeline
              </div>
              <div className="text-2xl font-black text-gray-900 font-mono tabular-nums mt-1">
                {formatCurrency(analytics.financials.totalBookingValue)}
              </div>
            </div>
          </div>

          {/* Recent Bookings Queue */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Recent Booking Requests</h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-[#D71920] hover:underline"
              >
                View all ({bookings.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Pickup Location</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.recentBookings.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="py-3 font-mono font-bold text-gray-900">{b.bookingNumber}</td>
                      <td className="py-3">{b.customerName || 'Customer'}</td>
                      <td className="py-3 truncate max-w-32">{b.pickupLocation}</td>
                      <td className="py-3">{formatDate(b.pickupAt)}</td>
                      <td className="py-3 font-mono font-bold text-gray-900">
                        {formatCurrency(b.priceBreakdown.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className="font-bold uppercase text-[11px] text-gray-700">
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {b.bookingStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'approved')}
                              className="px-2.5 py-1 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'rejected')}
                              className="px-2.5 py-1 font-bold text-red-600 hover:bg-red-50 rounded-md"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Fleet Management */}
      {activeTab === 'cars' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Fleet Inventory ({cars.length})</h3>
            <button
              onClick={() => {
                setEditingCar(null);
                setCarForm({
                  brand: '',
                  model: '',
                  year: 2024,
                  description: '',
                  category: 'Sedan',
                  dailyRate: 4500,
                  transmission: 'Automatic',
                  fuelType: 'Hybrid',
                  seats: 5,
                  location: 'Gulshan 2, Dhaka',
                  images: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
                  features: 'Apple CarPlay, AC, 360 Camera, Cruise Control',
                  vehicleStatus: 'available',
                });
                setCarModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add New Car
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(c => (
              <div
                key={c._id}
                className={`bg-white rounded-2xl border ${
                  !c.isPublished ? 'opacity-60 border-gray-300' : 'border-gray-200'
                } p-5 shadow-xs flex flex-col justify-between`}
              >
                <div>
                  <img
                    src={c.images[0]}
                    alt={c.model}
                    className="w-full aspect-16/10 object-cover rounded-xl mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#D71920] uppercase">{c.category}</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase">{c.vehicleStatus}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mt-1">
                    {c.brand} {c.model} ({c.year})
                  </h4>
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    {formatCurrency(c.dailyRate)} / day · {c.location}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {c.isPublished ? 'Published' : 'Archived'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCar(c);
                        setCarForm({
                          brand: c.brand,
                          model: c.model,
                          year: c.year,
                          description: c.description,
                          category: c.category as 'Sedan',
                          dailyRate: c.dailyRate,
                          transmission: c.transmission as 'Automatic',
                          fuelType: c.fuelType as 'Hybrid',
                          seats: c.seats,
                          location: c.location,
                          images: c.images.join('\n'),
                          features: c.features.join(', '),
                          vehicleStatus: c.vehicleStatus as 'available',
                        });
                        setCarModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchiveCar(c._id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'confirmed', 'completed', 'cancellation_requested', 'cancelled'].map(
                st => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${
                      bookingFilter === st
                        ? 'bg-[#D71920] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <button
              onClick={exportBookingsCSV}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-1.5 self-start"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Rental Window</th>
                    <th className="p-4">Itinerary</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Admin Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50/70">
                      <td className="p-4 font-mono font-bold text-gray-900">{b.bookingNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{b.customerName || 'N/A'}</div>
                        <div className="text-gray-500 text-[11px]">{b.customerPhone}</div>
                        <div className="text-gray-400 text-[10px]">{b.customerEmail}</div>
                      </td>
                      <td className="p-4">
                        <div>{formatDate(b.pickupAt)}</div>
                        <div className="text-gray-400 text-[11px]">to {formatDate(b.returnAt)}</div>
                        <div className="font-semibold text-gray-600 text-[10px]">{b.rentalDuration} Days</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{b.pickupLocation}</div>
                        <div className="text-gray-400 text-[11px]">→ {b.returnLocation}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-900">
                        {formatCurrency(b.priceBreakdown.totalAmount)}
                        <div className="text-[10px] font-sans font-normal text-gray-400 uppercase">
                          {b.paymentStatus}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold uppercase text-[11px] text-gray-800">
                          {b.bookingStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        {b.bookingStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'approved')}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'rejected')}
                              className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.bookingStatus === 'approved' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md"
                          >
                            Confirm Vehicle
                          </button>
                        )}

                        {['approved', 'confirmed'].includes(b.bookingStatus) && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                            className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md"
                          >
                            Mark Completed
                          </button>
                        )}

                        {b.bookingStatus === 'cancellation_requested' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b._id, 'cancelled', 'Approved cancellation request')}
                            className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-md"
                          >
                            Process Cancellation
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Customers */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-200 font-bold text-sm text-gray-900">
            Registered Customers ({customers.length})
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(cust => (
                <tr key={cust._id} className="hover:bg-gray-50/70">
                  <td className="p-4 font-bold text-gray-900">{cust.name}</td>
                  <td className="p-4">{cust.email}</td>
                  <td className="p-4">{cust.phone}</td>
                  <td className="p-4">{formatDate(cust.createdAt)}</td>
                  <td className="p-4">
                    <span
                      className={`font-bold uppercase text-[10px] ${
                        cust.accountStatus === 'active' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {cust.accountStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleCustomerStatus(cust._id, cust.accountStatus)}
                      className={`px-3 py-1 font-bold rounded-lg ${
                        cust.accountStatus === 'active'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {cust.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Revenue Reports */}
      {activeTab === 'reports' && analytics && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Actual Realized Cash Revenue
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
                {formatCurrency(analytics.financials.recordedRevenue)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Paid bookings and completed rentals</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Pending Receivable Payments
              </div>
              <div className="text-3xl font-black text-amber-600 font-mono mt-2">
                {formatCurrency(analytics.financials.pendingPaymentAmount)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Unpaid or approved bookings awaiting handoff</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Total Gross Booking Pipeline
              </div>
              <div className="text-3xl font-black text-gray-900 font-mono mt-2">
                {formatCurrency(analytics.financials.totalBookingValue)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">All reservation requests created</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Export Financial Audit Data</h3>
            <p className="text-xs text-gray-600 max-w-xl mb-4">
              Download complete, timestamped CSV records of all customer booking requests, prices, and status logs.
            </p>
            <button
              onClick={exportBookingsCSV}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl flex items-center gap-2 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Audit CSV
            </button>
          </div>
        </div>
      )}

      {/* Car Add / Edit Modal */}
      {carModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">
                {editingCar ? 'Edit Vehicle' : 'Add Vehicle to Fleet'}
              </h3>
              <button onClick={() => setCarModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={carForm.brand}
                    onChange={e => setCarForm({ ...carForm, brand: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={carForm.model}
                    onChange={e => setCarForm({ ...carForm, model: e.target.value })}
                    placeholder="e.g. Corolla Altis"
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={carForm.category}
                    onChange={e => setCarForm({ ...carForm, category: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Economy">Economy</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={carForm.year}
                    onChange={e => setCarForm({ ...carForm, year: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Daily Rate (BDT)</label>
                  <input
                    type="number"
                    value={carForm.dailyRate}
                    onChange={e => setCarForm({ ...carForm, dailyRate: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Transmission</label>
                  <select
                    value={carForm.transmission}
                    onChange={e => setCarForm({ ...carForm, transmission: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fuel Type</label>
                  <select
                    value={carForm.fuelType}
                    onChange={e => setCarForm({ ...carForm, fuelType: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Octane">Octane</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Passenger Seats</label>
                  <input
                    type="number"
                    value={carForm.seats}
                    onChange={e => setCarForm({ ...carForm, seats: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Fleet Hub Location</label>
                <input
                  type="text"
                  value={carForm.location}
                  onChange={e => setCarForm({ ...carForm, location: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={carForm.description}
                  onChange={e => setCarForm({ ...carForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URLs (One per line)</label>
                <textarea
                  value={carForm.images}
                  onChange={e => setCarForm({ ...carForm, images: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Features (Comma-separated)</label>
                <input
                  type="text"
                  value={carForm.features}
                  onChange={e => setCarForm({ ...carForm, features: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCarModalOpen(false)}
                  className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl shadow-xs"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
