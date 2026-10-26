import React from 'react';
import { X, Shield, FileCheck, RefreshCw } from 'lucide-react';

interface PoliciesModalProps {
  type: 'terms' | 'privacy' | 'cancellation' | null;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-6">
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'terms' && <FileCheck className="w-5 h-5 text-[#D71920]" />}
            {type === 'privacy' && <Shield className="w-5 h-5 text-[#D71920]" />}
            {type === 'cancellation' && <RefreshCw className="w-5 h-5 text-[#D71920]" />}
            <h3 className="text-lg font-black text-gray-900">
              {type === 'terms'
                ? 'Terms & Conditions'
                : type === 'privacy'
                ? 'Privacy Policy'
                : 'Rental Cancellation Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-xs text-gray-600 leading-relaxed space-y-4 max-h-[70vh] overflow-y-auto">
          {type === 'terms' && (
            <>
              <p className="font-semibold text-gray-900">
                1. Eligibility & Driver Verification
              </p>
              <p>
                Renting with GoWheels requires a valid National ID (NID) or passport and a minimum of 2 years of driving experience with an unexpired BRTA driving license. For chauffeur-driven reservations, our certified professional driver handles vehicle custody.
              </p>
              <p className="font-semibold text-gray-900">
                2. Fuel & Mileage Policy
              </p>
              <p>
                Unless stated as unlimited in the vehicle listing, vehicles are provided with a full tank of fuel and must be returned with an equivalent fuel level. Excess mileage above specified caps is billed at ৳18/km.
              </p>
              <p className="font-semibold text-gray-900">
                3. Prohibited Usage
              </p>
              <p>
                Sub-leasing, illegal substance transport, commercial off-roading, and driving under intoxication are strictly prohibited and nullify all insurance coverage.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p className="font-semibold text-gray-900">
                1. Information We Collect
              </p>
              <p>
                GoWheels collects names, contact phone numbers, email addresses, and trip itineraries solely to facilitate booking reservations and communication. We never sell or distribute your private data.
              </p>
              <p className="font-semibold text-gray-900">
                2. Data Encryption & Security
              </p>
              <p>
                All passwords are cryptographically salted and hashed using industry-standard bcrypt. Session tokens use secure, HttpOnly web credentials.
              </p>
            </>
          )}

          {type === 'cancellation' && (
            <>
              <p className="font-semibold text-gray-900">
                1. Free Cancellation Window
              </p>
              <p>
                You can cancel your booking request free of charge up to <strong>24 hours</strong> before the scheduled pickup time with a 100% full refund of any deposit paid.
              </p>
              <p className="font-semibold text-gray-900">
                2. Late Cancellation Fee
              </p>
              <p>
                Cancellations made within 24 hours of pickup incur a single day base rate fee to compensate vehicle reservation holds.
              </p>
              <p className="font-semibold text-gray-900">
                3. Admin Processing
              </p>
              <p>
                Cancellation requests submitted via your customer portal are reviewed within 4 business hours by our operations dispatch team.
              </p>
            </>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
