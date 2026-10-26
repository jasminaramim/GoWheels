import React, { useState } from 'react';
import { MapPin, Calendar, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onSearch: (params: {
    pickupLocation: string;
    returnLocation: string;
    pickupDate: string;
    returnDate: string;
  }) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onExploreClick }) => {
  // Default dates: tomorrow to 3 days after tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [pickupLocation, setPickupLocation] = useState('Dhaka (Gulshan / Banani)');
  const [returnLocation, setReturnLocation] = useState('Dhaka (Gulshan / Banani)');
  const [pickupDate, setPickupDate] = useState(`${tomorrow}T09:00`);
  const [returnDate, setReturnDate] = useState(`${threeDaysLater}T18:00`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      pickupLocation,
      returnLocation,
      pickupDate,
      returnDate,
    });
  };

  return (
    <div className="relative bg-white border-b border-[#E5E7EB] overflow-hidden">
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-radial-[at_top_right] from-red-50/50 via-white to-gray-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Value Props, and Search Widget */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D71920] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
              Your Journey, Our Drive.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#202124] tracking-tight leading-[1.08] text-balance">
              Find Your <span className="text-[#D71920]">Perfect Ride</span> Across Bangladesh.
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-xl">
              Experience hassle-free executive sedans, rugged SUVs, and spacious family vans. Verified vehicles, transparent BDT rates, and rapid booking approval.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Full Comprehensive Insurance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Fast 15-Min Approval</span>
              </div>
            </div>

            {/* Car Search Widget Box */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-md space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden transition-colors"
                    >
                      <option value="Dhaka (Gulshan / Banani)">Dhaka (Gulshan / Banani)</option>
                      <option value="Dhaka (Uttara / Airport)">Dhaka (Uttara / Airport)</option>
                      <option value="Dhaka (Dhanmondi / Mirpur)">Dhaka (Dhanmondi / Mirpur)</option>
                      <option value="Chattogram (Agrabad / GEC)">Chattogram (Agrabad / GEC)</option>
                      <option value="Sylhet (Zindabazar / Airport)">Sylhet (Zindabazar / Airport)</option>
                    </select>
                  </div>
                </div>

                {/* Return Location */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Return Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={returnLocation}
                      onChange={e => setReturnLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden transition-colors"
                    >
                      <option value="Same as Pickup Location">Same as Pickup Location</option>
                      <option value="Dhaka (Gulshan / Banani)">Dhaka (Gulshan / Banani)</option>
                      <option value="Dhaka (Uttara / Airport)">Dhaka (Uttara / Airport)</option>
                      <option value="Dhaka (Dhanmondi / Mirpur)">Dhaka (Dhanmondi / Mirpur)</option>
                      <option value="Chattogram (Agrabad / GEC)">Chattogram (Agrabad / GEC)</option>
                      <option value="Sylhet (Zindabazar / Airport)">Sylhet (Zindabazar / Airport)</option>
                    </select>
                  </div>
                </div>

                {/* Pickup Date & Time */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Return Date & Time */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Return Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D71920] focus:outline-hidden transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                  Instant real-time availability check
                </span>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Search Available Cars
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 bg-slate-900 aspect-16/11">
              <img
                src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop"
                alt="GoWheels Luxury Fleet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  Featured Fleet
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  Mercedes-Benz C200 AMG
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-sm">
                  Available in Gulshan with chauffeur service option and executive comfort.
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20">
                  <div className="font-mono text-lg font-bold">
                    ৳15,000 <span className="text-xs font-normal text-gray-300">/day</span>
                  </div>
                  <button
                    onClick={onExploreClick}
                    className="text-xs font-semibold text-white underline underline-offset-4 hover:text-red-300 transition-colors"
                  >
                    Browse full fleet →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
