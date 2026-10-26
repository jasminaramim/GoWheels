import React, { useState } from 'react';
import { ICar } from '../server/models/types.ts';
import { formatCurrency } from '../lib/api.ts';
import {
  X,
  Users,
  Fuel,
  Gauge,
  Briefcase,
  MapPin,
  CheckCircle,
  Calendar,
  ArrowRight,
  Shield,
  Star,
} from 'lucide-react';

interface CarDetailsModalProps {
  car: ICar;
  onClose: () => void;
  onBook: (car: ICar) => void;
}

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ car, onClose, onBook }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = car.images && car.images.length > 0
    ? car.images
    : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        {/* Header with Close */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
              {car.category} Fleet
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {car.brand} {car.model} ({car.year})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Gallery Module */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
              <img
                src={images[activeImageIndex]}
                alt={`${car.brand} ${car.model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-md text-xs font-bold text-gray-900">
                {car.location}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-[#D71920] scale-102' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                <Gauge className="w-5 h-5 text-[#D71920]" />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 font-medium">Transmission</div>
                <div className="text-sm font-bold text-gray-900">{car.transmission}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                <Fuel className="w-5 h-5 text-[#D71920]" />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 font-medium">Fuel Type</div>
                <div className="text-sm font-bold text-gray-900">{car.fuelType}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                <Users className="w-5 h-5 text-[#D71920]" />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 font-medium">Seating Capacity</div>
                <div className="text-sm font-bold text-gray-900">{car.seats} Passengers</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                <Briefcase className="w-5 h-5 text-[#D71920]" />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 font-medium">Luggage Capacity</div>
                <div className="text-sm font-bold text-gray-900">{car.luggage} Bags</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Vehicle Overview</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{car.description}</p>
          </div>

          {/* Key Features Grid */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Included Equipment & Features</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {car.features && car.features.map((feat, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <CheckCircle className="w-4 h-4 text-[#D71920] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Policies Strip */}
          <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#D71920] shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-gray-900">GoWheels Rental Protection</div>
                <div className="text-gray-600">Zero cancellation penalty up to 24 hours before pickup. Full sanitization before handoff.</div>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-700 whitespace-nowrap">
              Mileage: <span className="font-bold text-gray-900">{car.mileageLimit || 'Unlimited'}</span>
            </div>
          </div>
        </div>

        {/* Sticky Purchase Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium">Verified Daily Rental Rate</div>
            <div className="text-2xl font-black text-gray-900 font-mono tabular-nums">
              {formatCurrency(car.dailyRate)}
              <span className="text-xs font-sans font-medium text-gray-500 ml-1">/day</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-3 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Back to Catalog
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(car);
              }}
              className="flex-1 sm:flex-none px-8 py-3 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Book This Car
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
