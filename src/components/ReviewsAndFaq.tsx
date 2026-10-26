import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, MessageSquare, ArrowRight, ShieldCheck, Car } from 'lucide-react';

interface ReviewsAndFaqProps {
  onSelectCategory: (category: string) => void;
  onContactClick: () => void;
}

export const ReviewsAndFaq: React.FC<ReviewsAndFaqProps> = ({
  onSelectCategory,
  onContactClick,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    {
      name: 'Sedan',
      count: '3 Models',
      desc: 'Refined executive travel with maximum fuel economy and quiet cabin comfort.',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'SUV',
      count: '2 Models',
      desc: 'Elevated ground clearance and all-wheel-drive capability for family tours and rough terrain.',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Luxury',
      count: '2 Models',
      desc: 'Prestige marques (Mercedes-Benz, BMW) with executive chauffeur service.',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Van',
      count: '1 Model',
      desc: 'Spacious 10-seater VIP cabins for corporate transport and large family groups.',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Economy',
      count: '1 Model',
      desc: 'Compact agility and 24 km/L fuel efficiency for effortless city commutes.',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const reviews = [
    {
      name: 'Tanvir Ahmed',
      role: 'Tech Lead, Dhaka',
      car: 'Toyota Corolla Altis',
      rating: 5,
      comment:
        'Pristine vehicle condition, spotless interior, and my booking request was approved within 15 minutes. GoWheels is my definitive car rental choice whenever I have out-of-town project visits.',
    },
    {
      name: 'Nusrat Jahan',
      role: 'Corporate Partner, Banani',
      car: 'Mercedes-Benz C200 AMG',
      rating: 5,
      comment:
        'Rented the Mercedes C-Class for foreign diplomatic delegates visiting Gulshan. The vehicle arrived in showroom finish with a punctual, polite chauffeur. Seamless experience.',
    },
    {
      name: 'Fahim Rahman',
      role: 'Family Vacationer, Sylhet',
      car: 'Honda CR-V Turbo AWD',
      rating: 5,
      comment:
        'The all-wheel-drive handling gave us complete confidence driving through rain and hilly tea gardens around Sreemangal. Transparent pricing with zero hidden surcharges.',
    },
  ];

  const faqs = [
    {
      q: 'What documents are required to rent a vehicle in Bangladesh?',
      a: 'For self-drive rentals, you need a valid National ID card (NID) or Passport, an active BRTA Driving License (minimum 2 years validity), and a verifiable contact address. For chauffeur-driven rentals, only basic contact verification is required.',
    },
    {
      q: 'How does the booking approval model work?',
      a: 'When you submit a reservation request, our operations team verifies vehicle dispatch logistics and schedule clearance to prevent any overlap. You receive confirmation within 15 minutes via dashboard notification and email.',
    },
    {
      q: 'How does GoWheels prevent double-booking or reservation overlaps?',
      a: 'Our database booking engine uses atomic date range verification. When a booking is submitted or approved, overlapping intervals are blocked instantly.',
    },
    {
      q: 'What is your payment model and cancellation policy?',
      a: 'We support Cash on Handover at pickup or digital transfer (bKash/Nagad/Bank). Cancellations requested at least 24 hours prior to pickup are 100% free of charge with zero cancellation penalties.',
    },
    {
      q: 'Is doorstep delivery and pickup available?',
      a: 'Yes! We deliver vehicles to your home, office, or airport terminals across Dhaka, Chattogram, and Sylhet for a modest fixed convenience fee.',
    },
  ];

  return (
    <div className="space-y-20 py-12">
      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
              Fleet Variety
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Browse Vehicles by Category
            </h2>
          </div>
          <span className="text-xs text-gray-500">Every car verified & mechanically certified</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => onSelectCategory(cat.name)}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-[#D71920] p-4 text-left shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="aspect-16/10 rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#D71920] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-gray-400">{cat.count}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-bold text-[#D71920] flex items-center justify-between">
                <span>View Models</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
              Verified Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Trusted by Hundreds of Drivers
            </h2>
            <p className="text-xs text-gray-500">
              Real testimonials from corporate partners, executives, and travelers across Bangladesh.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="bg-gray-50/70 rounded-2xl border border-gray-200 p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="font-bold text-gray-900 text-xs">{rev.name}</div>
                  <div className="text-[11px] text-gray-500">{rev.role}</div>
                  <div className="text-[10px] text-[#D71920] font-semibold mt-0.5">
                    Rented: {rev.car}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
            Clear Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left text-xs font-bold text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-bold">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#D71920] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Contact CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              Need a Custom Corporate or Long-Term Rental?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our fleet managers can accommodate multi-vehicle contracts, dedicated airport chauffeurs, and customized inter-district travel plans.
            </p>
          </div>

          <button
            onClick={onContactClick}
            className="px-8 py-3.5 text-xs font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl shadow-md whitespace-nowrap transition-all"
          >
            Speak to Fleet Operations
          </button>
        </div>
      </section>
    </div>
  );
};
