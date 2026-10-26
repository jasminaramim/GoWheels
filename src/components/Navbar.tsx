import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Car, User, Shield, LogOut, Menu, X, ChevronDown, Bell } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, unreadCount = 0 }) => {
  const { user, logout, openAuthModal } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left text-2xl font-black tracking-tight text-[#202124] whitespace-nowrap shrink-0 group focus:outline-hidden"
        >
          <span className="w-9 h-9 rounded-xl bg-[#D71920] flex items-center justify-center text-white shadow-sm group-hover:bg-[#B5121B] transition-colors">
            <Car className="w-5 h-5" />
          </span>
          <span className="tracking-tight font-extrabold text-[#202124]">
            Go<span className="text-[#D71920]">Wheels</span>
          </span>
        </button>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#4B5563]">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D71920] ${
              currentView === 'home' ? 'text-[#D71920] border-b-2 border-[#D71920] pb-1' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('cars')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D71920] ${
              currentView === 'cars' ? 'text-[#D71920] border-b-2 border-[#D71920] pb-1' : ''
            }`}
          >
            All Cars
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D71920] ${
              currentView === 'how-it-works' ? 'text-[#D71920] border-b-2 border-[#D71920] pb-1' : ''
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D71920] ${
              currentView === 'about' ? 'text-[#D71920] border-b-2 border-[#D71920] pb-1' : ''
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D71920] ${
              currentView === 'contact' ? 'text-[#D71920] border-b-2 border-[#D71920] pb-1' : ''
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg border border-[#E5E7EB] hover:border-gray-300 bg-white text-xs font-semibold text-[#202124] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-[#FDE8E9] text-[#D71920] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left max-w-28 truncate">
                  <div className="leading-tight font-medium text-slate-900 truncate">{user.name}</div>
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">
                    {user.role}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#D71920]" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-2 z-40 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                    </div>

                    {user.role === 'admin' ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-[#D71920] font-semibold flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    ) : null}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('customer-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        My Bookings & Profile
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#D71920] text-white text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('notifications');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4 text-gray-400" />
                      Notifications
                    </button>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#D71920] transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="hidden sm:inline-flex px-4.5 py-2 text-xs font-semibold text-white bg-[#D71920] hover:bg-[#B5121B] rounded-lg transition-all shadow-xs whitespace-nowrap"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-5 space-y-2 text-sm font-semibold">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('home');
            }}
            className="block w-full text-left py-2 text-gray-800 hover:text-[#D71920]"
          >
            Home
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('cars');
            }}
            className="block w-full text-left py-2 text-gray-800 hover:text-[#D71920]"
          >
            All Cars
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('how-it-works');
            }}
            className="block w-full text-left py-2 text-gray-800 hover:text-[#D71920]"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('about');
            }}
            className="block w-full text-left py-2 text-gray-800 hover:text-[#D71920]"
          >
            About Us
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('contact');
            }}
            className="block w-full text-left py-2 text-gray-800 hover:text-[#D71920]"
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
};
