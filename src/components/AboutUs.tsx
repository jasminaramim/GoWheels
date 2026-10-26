import React from 'react';
import { Shield, Award, Users, MapPin } from 'lucide-react';

export const AboutUs: React.FC<{ onBrowseFleet: () => void }> = ({ onBrowseFleet }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
            About GoWheels
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Elevating Mobility Across Bangladesh with Trust and Precision
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Founded with a commitment to modernizing vehicle rentals in Bangladesh, GoWheels bridges the gap between vehicle owners, businesses, and discerning travelers.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Whether navigating the commercial corridors of Dhaka, embarking on scenic tea garden retreats in Sreemangal, or organizing inter-district corporate delegations in Chattogram, GoWheels delivers pristine vehicles and dependable service.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop"
              alt="GoWheels operations"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Safety First</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every vehicle in our catalog undergoes rigorous multi-point safety testing, regular mechanical inspection, and sanitization before departure.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Transparent Pricing</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Clear daily rates in Bangladeshi Taka (৳). No surprise charges, hidden toll surcharges, or opaque driver allowance clauses.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Verified Chauffeurs</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our experienced drivers are BRTA-certified, background-checked, and trained in defensive driving and courteous customer hospitality.
          </p>
        </div>
      </div>

      {/* Operational Hubs */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
            Nationwide Presence
          </div>
          <h3 className="text-xl font-black text-gray-900 mt-1">Our Service Hubs</h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D71920]" />
              Dhaka Flagship Hub
            </div>
            <div className="text-gray-500">House 42, Road 11, Gulshan 2, Dhaka 1212</div>
            <div className="text-gray-400">Hub Fleet: 45+ Vehicles</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D71920]" />
              Chattogram Commercial Hub
            </div>
            <div className="text-gray-500">Agrabad Commercial Area, Chattogram 4100</div>
            <div className="text-gray-400">Hub Fleet: 25+ Vehicles</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D71920]" />
              Sylhet Airport Hub
            </div>
            <div className="text-gray-500">Airport Road, Zindabazar, Sylhet 3100</div>
            <div className="text-gray-400">Hub Fleet: 18+ Vehicles</div>
          </div>
        </div>
      </div>
    </div>
  );
};
