import React, { useState } from 'react';
import { ICar } from '../server/models/types.ts';
import { formatCurrency } from '../lib/api.ts';
import { Users, Fuel, Gauge, MapPin, Star, ArrowRight } from 'lucide-react';

interface CarCardProps {
  car: ICar;
  onSelect: (car: ICar) => void;
  onBook: (car: ICar) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onSelect, onBook }) => {
  const [imageError, setImageError] = useState(false);
  const primaryImage = car.images && car.images[0] ? car.images[0] : '';

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E7EB] hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image Container with 4:3 ratio and resilient fallback */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(car)}>
        {!imageError && primaryImage ? (
          <img
            src={primaryImage}
            alt={`${car.brand} ${car.model}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <Gauge className="w-12 h-12 mb-2 text-slate-400/80 stroke-1" />
            <span className="text-xs font-semibold text-slate-600">{car.brand} {car.model}</span>
          </div>
        )}

        {/* Quiet availability tag */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-gray-800 tracking-wide border border-black/5 shadow-xs">
          {car.category}
        </div>

        {car.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md text-[11px] font-semibold text-gray-800 flex items-center gap-1 border border-black/5 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{car.rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({car.reviewCount || 0})</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{car.location}</span>
          </div>

          {/* Vehicle Name */}
          <h3
            onClick={() => onSelect(car)}
            className="text-lg font-bold text-[#202124] group-hover:text-[#D71920] transition-colors cursor-pointer truncate"
          >
            {car.brand} {car.model}
          </h3>

          {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-[#6B7280] mt-2 mb-4 font-medium">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-gray-400" />
              {car.transmission}
            </span>
            <span aria-hidden="true" className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-gray-400" />
              {car.fuelType}
            </span>
            <span aria-hidden="true" className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {car.seats} Seats
            </span>
          </div>
        </div>

        {/* Price & CTA Action Bar */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">
              Daily Rate
            </div>
            <div className="text-lg font-black text-[#202124] font-mono tabular-nums">
              {formatCurrency(car.dailyRate)}
              <span className="text-xs font-sans font-medium text-[#6B7280] ml-1">/day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(car)}
              className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[#D71920] border border-gray-200 hover:border-gray-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Details
            </button>
            <button
              onClick={() => onBook(car)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-lg transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
            >
              Book Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
