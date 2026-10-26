import React, { useState, useEffect } from 'react';
import { ICar, IPriceBreakdown, IReview } from '../server/models/types.ts';
import { apiRequest, formatCurrency, formatDate } from '../lib/api.ts';
import {
  ArrowLeft,
  Users,
  Fuel,
  Gauge,
  Briefcase,
  MapPin,
  CheckCircle,
  Calendar,
  Shield,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
} from 'lucide-react';

interface CarDetailsPageProps {
  car: ICar;
  onBack: () => void;
  onBook: (car: ICar, dates?: { pickupDate: string; returnDate: string; pickupLocation: string; returnLocation: string }) => void;
}

export const CarDetailsPage: React.FC<CarDetailsPageProps> = ({ car, onBack, onBook }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Quote / Trip selector state
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [pickupLocation, setPickupLocation] = useState(car.location);
  const [returnLocation, setReturnLocation] = useState(car.location);
  const [pickupAt, setPickupAt] = useState(`${tomorrow}T09:00`);
  const [returnAt, setReturnAt] = useState(`${threeDaysLater}T18:00`);

  const [priceBreakdown, setPriceBreakdown] = useState<IPriceBreakdown | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const images = car.images && car.images.length > 0
    ? car.images
    : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop'];

  // Fetch reviews for this car
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiRequest<IReview[]>(`/cars/${car._id}/reviews`);
        if (res.data) setReviews(res.data);
      } catch {
        // ignore
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [car._id]);

  // Recalculate quotation whenever dates change
  useEffect(() => {
    let active = true;
    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError('');
      try {
        const res = await apiRequest<{ priceBreakdown: IPriceBreakdown }>(
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
          setPriceBreakdown(res.priceBreakdown);
        }
      } catch (err: unknown) {
        if (active) {
          setQuoteError(err instanceof Error ? err.message : 'Invalid dates selected');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#D71920] bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Cars
        </button>

        <div className="text-xs text-gray-500 font-medium hidden sm:block">
          <span>Fleet</span> <span className="mx-1">/</span>
          <span>{car.category}</span> <span className="mx-1">/</span>
          <span className="text-gray-900 font-bold">{car.brand} {car.model}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery, Specs, Overview, Features, Reviews (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Vehicle Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#D71920] uppercase tracking-wider">
              <span>{car.category} Class</span>
              <span>·</span>
              <span className="text-gray-500 font-semibold">{car.location}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mt-1 tracking-tight">
              {car.brand} {car.model} <span className="text-gray-400 font-semibold">({car.year})</span>
            </h1>

            {car.rating && (
              <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-700">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="ml-1 text-gray-900 font-bold">{car.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{car.reviewCount || reviews.length} Verified Customer Reviews</span>
              </div>
            )}
          </div>

          {/* Photo Showcase Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-16/10 bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-gray-200">
              <img
                src={images[activeImageIndex]}
                alt={`${car.brand} ${car.model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-xs">
                {car.location}
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-xs uppercase">
                {car.vehicleStatus}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-28 h-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#D71920] shadow-sm scale-102'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Mechanical Specifications Grid */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
              Vehicle Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#D71920] flex items-center justify-center shrink-0 shadow-2xs">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">Transmission</div>
                  <div className="text-xs font-bold text-gray-900">{car.transmission}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#D71920] flex items-center justify-center shrink-0 shadow-2xs">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">Fuel Type</div>
                  <div className="text-xs font-bold text-gray-900">{car.fuelType}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#D71920] flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">Passengers</div>
                  <div className="text-xs font-bold text-gray-900">{car.seats} Seats</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#D71920] flex items-center justify-center shrink-0 shadow-2xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">Luggage</div>
                  <div className="text-xs font-bold text-gray-900">{car.luggage || 3} Bags</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Mileage Policy:</span>
                <span className="font-bold text-gray-900">{car.mileageLimit || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Vehicle Registration:</span>
                <span className="font-mono font-bold text-gray-900">{car.plateNumber || 'Verified BRTA'}</span>
              </div>
            </div>
          </div>

          {/* Detailed Overview */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-gray-900">Vehicle Description</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{car.description}</p>
          </div>

          {/* Included Features & Amenities */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Included Equipment & Features</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {car.features && car.features.map((feat, index) => (
                <div key={index} className="flex items-center gap-2.5 font-semibold text-gray-700">
                  <CheckCircle className="w-4 h-4 text-[#D71920] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GoWheels Peace of Mind Protection */}
          <div className="bg-red-50/60 rounded-3xl border border-red-100 p-6 flex items-start gap-4 shadow-2xs">
            <ShieldCheck className="w-8 h-8 text-[#D71920] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-gray-900 text-sm">GoWheels Rental Guarantee</div>
              <p className="text-gray-600 leading-relaxed">
                Free cancellation up to 24 hours prior to scheduled pickup. Vehicle arrives mechanically checked, fully sanitized, and with active 24/7 highway towing assistance across Bangladesh.
              </p>
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D71920]" />
                Customer Reviews ({reviews.length})
              </h3>
            </div>

            {reviewsLoading ? (
              <div className="text-xs text-gray-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                No customer reviews posted for this vehicle yet. Be the first to rent and leave feedback!
              </p>
            ) : (
              <div className="divide-y divide-gray-100 space-y-4">
                {reviews.map(r => (
                  <div key={r._id} className="pt-4 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900">{r.userName}</div>
                      <div className="flex items-center text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{r.comment}</p>
                    <div className="text-[10px] text-gray-400">{formatDate(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Purchase & Quotation Module (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-lg space-y-6">
            {/* Price Header */}
            <div className="flex items-baseline justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Daily Rental Rate
                </span>
                <div className="text-3xl font-black text-gray-900 font-mono tabular-nums">
                  {formatCurrency(car.dailyRate)}
                  <span className="text-xs font-sans font-medium text-gray-500 ml-1">/day</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Available Now
              </span>
            </div>

            {/* Date & Location Selectors */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D71920]" />
                Select Rental Schedule
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupAt}
                    onChange={e => setPickupAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
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
                    className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup Hub or Delivery Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                    placeholder="e.g. Gulshan 2 Hub or Dhaka Airport"
                    className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
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
                    placeholder="e.g. Same location or Airport"
                    className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {quoteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                {quoteError}
              </div>
            )}

            {/* Live Quotation Summary */}
            {priceBreakdown && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="font-bold text-gray-900 mb-1 flex items-center justify-between">
                  <span>Price Quotation</span>
                  <span className="font-normal text-gray-500">{priceBreakdown.days} Days</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Base Rate ({formatCurrency(priceBreakdown.dailyRate)} × {priceBreakdown.days}d)</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.baseTotal)}</span>
                </div>

                {priceBreakdown.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Doorstep Delivery Fee</span>
                    <span className="font-mono">{formatCurrency(priceBreakdown.deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Inspection & Sanitization Fee</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.serviceFee)}</span>
                </div>

                {priceBreakdown.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Multi-Day Discount (10%)</span>
                    <span className="font-mono">-{formatCurrency(priceBreakdown.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Government VAT (5%)</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.tax)}</span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline text-base font-black text-gray-900">
                  <span>Estimated Total</span>
                  <span className="font-mono text-[#D71920] text-xl tabular-nums">
                    {formatCurrency(priceBreakdown.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Booking Action Button */}
            <button
              onClick={() =>
                onBook(car, {
                  pickupDate: pickupAt,
                  returnDate: returnAt,
                  pickupLocation,
                  returnLocation,
                })
              }
              disabled={quoteLoading || !priceBreakdown}
              className="w-full py-4 text-sm font-bold text-white bg-[#D71920] hover:bg-[#B5121B] disabled:opacity-60 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Book This Car Now
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-gray-400">
              Cash on delivery or manual bank transfer. Zero card deposit required upfront.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
