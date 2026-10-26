import React from 'react';
import { Search, Calendar, FileCheck, KeyRound, ArrowRight, ShieldCheck, Headphones, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC<{ onBrowseFleet: () => void }> = ({ onBrowseFleet }) => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Find Your Preferred Vehicle',
      desc: 'Browse our verified fleet across Dhaka, Chattogram, and Sylhet. Filter by category, transmission, passenger seats, and daily rate.',
    },
    {
      num: '02',
      icon: Calendar,
      title: 'Select Dates & Handoff Location',
      desc: 'Pick your exact dates, time, and preferred hub or doorstep delivery address. Our engine automatically recalculates transparent BDT quotes.',
    },
    {
      num: '03',
      icon: FileCheck,
      title: 'Submit Reservation Request',
      desc: 'Submit your request with contact details and optional driver requests. Our operations team reviews and approves within 15 minutes.',
    },
    {
      num: '04',
      icon: KeyRound,
      title: 'Vehicle Handoff & Drive',
      desc: 'Inspect the sanitized vehicle, verify fuel and documents, pay via cash or transfer upon handover, and hit the road with 24/7 roadside assistance.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
          Simple 4-Step Process
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          How GoWheels Works
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          From discovery to vehicle ignition, renting a car in Bangladesh has never been this seamless, transparent, and dependable.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs relative flex flex-col justify-between hover:border-gray-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-gray-200">{st.num}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{st.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why Choose GoWheels Strip */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
            Built on Trust & Integrity
          </div>
          <h2 className="text-2xl font-black text-gray-900 mt-1">
            Why Discerning Drivers Choose GoWheels
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 text-xs text-gray-600">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-[#D71920]" />
              Verified Ownership & Maintenance
            </div>
            <p>Every vehicle undergoes multi-point inspection, scheduled mechanical servicing, and thorough sanitization prior to release.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Sparkles className="w-5 h-5 text-[#D71920]" />
              Zero Hidden Charges
            </div>
            <p>The price you see is the price you pay. Itemized fuel policies, daily rates, and taxes are clearly documented with zero surprises.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
              <Headphones className="w-5 h-5 text-[#D71920]" />
              24/7 Dedicated Support
            </div>
            <p>Direct line to dispatch managers and emergency roadside towing assistance anywhere across national highways.</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-red-600 to-[#D71920] rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 shadow-lg">
        <h3 className="text-2xl font-black">Ready for Your Next Destination?</h3>
        <p className="text-xs text-red-100 max-w-md mx-auto">
          Explore our executive sedans, family SUVs, and premium passenger vans with immediate booking approval.
        </p>
        <button
          onClick={onBrowseFleet}
          className="px-8 py-3 bg-white text-[#D71920] font-bold text-xs rounded-xl shadow-md hover:bg-red-50 transition-all inline-flex items-center gap-2"
        >
          Browse Fleet Catalog
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
