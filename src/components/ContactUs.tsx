import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
          Get In Touch
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Contact GoWheels Operations
        </h1>
        <p className="text-xs text-gray-500">
          Have an inquiry regarding fleet availability, corporate leasing, or customized tours? Our team responds within 1 hour.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information & Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Direct Support Channels</h3>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D71920] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">24/7 National Dispatch Hotline</div>
                  <div>+880 9612-GOWHEELS (+880 9612-469433)</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Toll-free across Bangladesh</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D71920] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Email Operations</div>
                  <div>reservations@gowheels.com</div>
                  <div>corporate@gowheels.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D71920] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Operating Hours</div>
                  <div>Fleet Handoffs: 24/7 (Prior reservation required)</div>
                  <div>Office Hub: Sunday – Thursday, 8:00 AM – 9:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-gray-900">Dhaka Operations Headquarters</h3>
            <div className="flex items-start gap-2 text-gray-500">
              <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
              <span>House 42, Road 11, Gulshan 2, Dhaka 1212, Bangladesh</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Received</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Thank you, <strong>{name}</strong>! Your inquiry has been forwarded to our duty manager. We will contact you at <strong>{phone || email}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="px-6 py-2 text-xs font-bold text-white bg-[#D71920] rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-gray-900">Send an Operational Inquiry</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+880 1711-XXXXXX"
                    className="w-full p-2.5 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Message or Trip Requirements
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Detail your vehicle preference, rental duration, or special logistics..."
                  rows={4}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
