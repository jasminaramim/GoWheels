import React, { useState, useEffect } from 'react';
import { ICar, IPriceBreakdown, IBooking } from '../server/models/types.ts';
import { apiRequest, formatCurrency } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface BookingModalProps {
  car: ICar;
  initialDates?: {
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    returnLocation: string;
  };
  onClose: () => void;
  onSuccess: (booking: IBooking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  car,
  initialDates,
  onClose,
  onSuccess,
}) => {
  const { user, openAuthModal } = useAuth();

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [pickupLocation, setPickupLocation] = useState(
    initialDates?.pickupLocation || car.location
  );
  const [returnLocation, setReturnLocation] = useState(
    initialDates?.returnLocation || car.location
  );
  const [pickupAt, setPickupAt] = useState(
    initialDates?.pickupDate || `${tomorrow}T09:00`
  );
  const [returnAt, setReturnAt] = useState(
    initialDates?.returnDate || `${threeDaysLater}T18:00`
  );

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'manual_bank' | 'card_gateway'>('cash');

  const [priceBreakdown, setPriceBreakdown] = useState<IPriceBreakdown | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<IBooking | null>(null);

  // Sync user info when login state changes
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Recalculate quote whenever dates change
  useEffect(() => {
    let active = true;
    const fetchQuote = async () => {
      setErrorMessage('');
      setQuoteLoading(true);
      try {
        const res = await apiRequest(
          `/cars/${car._id}/quote`,
          {
            method: 'POST',
            body: JSON.stringify({
              pickupAt,
              returnAt,
              isDeliveryRequested: pickupLocation.toLowerCase() !== car.location.toLowerCase(),
            }),
          }
        );
        if (active && res.priceBreakdown) {
          setPriceBreakdown(res.priceBreakdown as IPriceBreakdown);
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Invalid dates selected';
          setErrorMessage(msg);
          setPriceBreakdown(null);
        }
      } finally {
        if (active) setQuoteLoading(false);
      }
    };

    fetchQuote();
    return () => {
      active = false;
    };
  }, [car._id, pickupAt, returnAt, pickupLocation, car.location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      openAuthModal('login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<IBooking>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          carId: car._id,
          pickupLocation,
          returnLocation,
          pickupAt,
          returnAt,
          customerName,
          customerEmail,
          customerPhone,
          customerNotes,
          paymentMethod,
        }),
      });

      if (res.data) {
        setConfirmedBooking(res.data);
        onSuccess(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking submission failed';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
              Rental Reservation
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              Book {car.brand} {car.model}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation Success State */
          <div className="p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Booking Request Submitted
              </span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                Ref: {confirmedBooking.bookingNumber}
              </h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Thank you! Your rental request for <strong>{car.brand} {car.model}</strong> has been submitted. Our operations team will review and approve your booking shortly.
              </p>
            </div>

            {/* Price breakdown confirmation card */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-gray-600">
                <span>Duration</span>
                <span className="font-semibold text-gray-900">{confirmedBooking.rentalDuration} Days</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pickup Location</span>
                <span className="font-semibold text-gray-900">{confirmedBooking.pickupLocation}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Model</span>
                <span className="font-semibold text-gray-900 uppercase">{confirmedBooking.paymentMethod} (Pending)</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                <span>Total Amount</span>
                <span className="font-mono text-[#D71920]">
                  {formatCurrency(confirmedBooking.priceBreakdown.totalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Vehicle Quick Summary Card */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <img
                src={car.images[0]}
                alt={car.model}
                referrerPolicy="no-referrer"
                className="w-20 h-14 object-cover rounded-xl border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {car.brand} {car.model} ({car.year})
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{car.transmission}</span>
                  <span>·</span>
                  <span>{car.fuelType}</span>
                  <span>·</span>
                  <span>{car.seats} Seats</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 font-bold uppercase">Daily Rate</div>
                <div className="font-mono font-bold text-sm text-gray-900">
                  {formatCurrency(car.dailyRate)}
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Reservation Notice</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Section 1: Dates & Location */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D71920]" />
                Trip Itinerary & Dates
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupAt}
                    onChange={e => setPickupAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Return Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={returnAt}
                    onChange={e => setReturnAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                    placeholder="e.g. Gulshan 2 Hub or Dhaka Airport"
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Return Location
                  </label>
                  <input
                    type="text"
                    value={returnLocation}
                    onChange={e => setReturnLocation(e.target.value)}
                    placeholder="e.g. Return at same location"
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D71920]" />
                Customer Contact Details
              </h4>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Optional Trip Notes & Requests
                </label>
                <textarea
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="Need English-speaking chauffeur, infant child seat, or airport terminal greeting..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Section 3: Payment Method Selection */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#D71920]" />
                Payment Model
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-[#D71920] bg-red-50/40 text-gray-900 font-bold'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#D71920]" />
                  <div className="text-xs">
                    <div>Cash on Handover</div>
                    <div className="text-[10px] text-gray-500 font-normal">Pay driver or hub upon arrival</div>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('manual_bank')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === 'manual_bank'
                      ? 'border-[#D71920] bg-red-50/40 text-gray-900 font-bold'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#D71920]" />
                  <div className="text-xs">
                    <div>Bank / bKash / Nagad</div>
                    <div className="text-[10px] text-gray-500 font-normal">Manual digital transfer receipt</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Server-Side Calculated Price Breakdown */}
            {priceBreakdown && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="font-bold text-gray-900 mb-2">Itemized Price Breakdown</div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Daily Rate ({formatCurrency(priceBreakdown.dailyRate)} × {priceBreakdown.days} Days)
                  </span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.baseTotal)}</span>
                </div>

                {priceBreakdown.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Doorstep Delivery & Handoff</span>
                    <span className="font-mono">{formatCurrency(priceBreakdown.deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Sanitization & 24/7 Roadside Assist</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.serviceFee)}</span>
                </div>

                {priceBreakdown.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Extended Rental Savings</span>
                    <span className="font-mono">-{formatCurrency(priceBreakdown.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Applicable Government VAT (5%)</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.tax)}</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                  <span>Total Due</span>
                  <span className="font-mono text-[#D71920] tabular-nums">
                    {formatCurrency(priceBreakdown.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              {!user ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between gap-3">
                  <span>Please sign in or create an account to finalize this reservation.</span>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shrink-0"
                  >
                    Sign In to Book
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || quoteLoading || !priceBreakdown}
                  className="w-full py-3.5 text-sm font-bold text-white bg-[#D71920] hover:bg-[#B5121B] disabled:opacity-60 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting Reservation...' : 'Submit Booking Request'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
