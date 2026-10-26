import React from 'react';
import { Car, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenPolicy: (policy: 'terms' | 'privacy' | 'cancellation') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy }) => {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-gray-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#D71920] flex items-center justify-center text-white font-bold">
                <Car className="w-4 h-4" />
              </span>
              <span className="text-xl font-extrabold text-[#202124] tracking-tight">
                Go<span className="text-[#D71920]">Wheels</span>
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed max-w-sm">
              Your Journey, Our Drive. Bangladesh&apos;s premier full-stack car rental platform delivering spotless executive vehicles, transparent BDT rates, and trusted chauffeur options.
            </p>
            <div className="space-y-1.5 text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                <span>House 42, Road 11, Gulshan 2, Dhaka 1212</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D71920]" />
                <span>+880 9612-GOWHEELS (24/7 Roadside Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D71920]" />
                <span>support@gowheels.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-4">
              Explore Fleet
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('cars')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  All Vehicles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cars')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Executive Sedans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cars')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Family SUVs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cars')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Luxury & Chauffeur
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cars')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Passenger Vans
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  About GoWheels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Contact Operations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('customer-dashboard')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Customer Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Trust */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('cancellation')}
                  className="hover:text-[#D71920] transition-colors"
                >
                  Cancellation Policy
                </button>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-1.5 text-[#D71920] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Licensed & Insured</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-[11px]">
          <div>© {new Date().getFullYear()} GoWheels Bangladesh Ltd. All rights reserved.</div>
          <div className="flex gap-6">
            <button onClick={() => onOpenPolicy('terms')} className="hover:underline">
              Terms of Service
            </button>
            <button onClick={() => onOpenPolicy('privacy')} className="hover:underline">
              Privacy Shield
            </button>
            <button onClick={() => onOpenPolicy('cancellation')} className="hover:underline">
              Refund Schedule
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
