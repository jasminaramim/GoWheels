import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { CarCard } from './components/CarCard.tsx';
import { CarsCatalog } from './components/CarsCatalog.tsx';
import { CarDetailsPage } from './components/CarDetailsPage.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { AboutUs } from './components/AboutUs.tsx';
import { ContactUs } from './components/ContactUs.tsx';
import { ReviewsAndFaq } from './components/ReviewsAndFaq.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PoliciesModal } from './components/PoliciesModal.tsx';
import { apiRequest } from './lib/api.ts';
import { ICar, IBooking } from './server/models/types.ts';
import { ArrowRight } from 'lucide-react';

function MainApp() {
  const { user, openAuthModal } = useAuth();

  const [currentView, setCurrentView] = useState<
    'home' | 'cars' | 'car-details' | 'how-it-works' | 'about' | 'contact' | 'customer-dashboard' | 'admin' | 'notifications'
  >('home');
  const [featuredCars, setFeaturedCars] = useState<ICar[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Selected car for dedicated details page
  const [selectedCar, setSelectedCar] = useState<ICar | null>(null);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState<ICar | null>(null);
  const [searchDates, setSearchDates] = useState<{
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    returnLocation: string;
  } | undefined>(undefined);

  const [policyModal, setPolicyModal] = useState<'terms' | 'privacy' | 'cancellation' | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Handle URL hash changes (e.g. #admin, #cars, #car/slug)
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'admin' || window.location.pathname === '/admin') {
        if (user?.role === 'admin') {
          setCurrentView('admin');
        } else {
          openAuthModal('login');
        }
      } else if (hash.startsWith('car/')) {
        const identifier = hash.replace('car/', '');
        try {
          const res = await apiRequest<ICar>(`/cars/${identifier}`);
          if (res.data) {
            setSelectedCar(res.data);
            setCurrentView('car-details');
          }
        } catch {
          // fallback
        }
      } else if (['home', 'cars', 'how-it-works', 'about', 'contact'].includes(hash)) {
        setCurrentView(hash as any);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [user]);

  // Fetch top 6 featured cars for homepage
  const fetchFeaturedCars = async () => {
    setFeaturedLoading(true);
    try {
      const res = await apiRequest<ICar[]>('/cars?limit=6&sort=newest');
      if (res.data) {
        setFeaturedCars(res.data);
      }
    } catch {
      // ignore
    } finally {
      setFeaturedLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  // Handle hero search submission
  const handleHeroSearch = (params: {
    pickupLocation: string;
    returnLocation: string;
    pickupDate: string;
    returnDate: string;
  }) => {
    setSearchDates(params);
    setCatalogCategory('all');
    setCatalogSearch('');
    setCurrentView('cars');
    window.location.hash = 'cars';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromHome = (category: string) => {
    setCatalogCategory(category);
    setCatalogSearch('');
    setCurrentView('cars');
    window.location.hash = 'cars';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to dedicated Car Details Page (NOT a popup)
  const handleOpenCarPage = (car: ICar) => {
    setSelectedCar(car);
    setCurrentView('car-details');
    window.location.hash = `car/${car.slug || car._id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookCar = (
    car: ICar,
    dates?: { pickupDate: string; returnDate: string; pickupLocation: string; returnLocation: string }
  ) => {
    if (dates) {
      setSearchDates(dates);
    }
    setSelectedCarForBooking(car);
  };

  const handleBookingSuccess = (_booking: IBooking) => {
    // Booking successful
  };

  const handleNavigate = (view: string) => {
    if (view === 'admin') {
      if (user?.role !== 'admin') {
        openAuthModal('login');
        return;
      }
      setCurrentView('admin');
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if ((view === 'customer-dashboard' || view === 'notifications') && !user) {
      openAuthModal('login');
      return;
    }
    setCurrentView(view as any);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#202124]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        unreadCount={0}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            {/* Hero Section */}
            <Hero
              onSearch={handleHeroSearch}
              onExploreClick={() => {
                setCatalogCategory('all');
                setCurrentView('cars');
                window.location.hash = 'cars';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Cars Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
                    Hand-Picked Selection
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                    Featured Rental Fleet
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setCatalogCategory('all');
                    setCurrentView('cars');
                    window.location.hash = 'cars';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-[#D71920] hover:text-[#B5121B] flex items-center gap-1 group self-start"
                >
                  <span>Explore full 10+ fleet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {featuredLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 animate-pulse">
                      <div className="aspect-4/3 bg-gray-100 rounded-xl" />
                      <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCars.map(car => (
                    <CarCard
                      key={car._id}
                      car={car}
                      onSelect={c => handleOpenCarPage(c)}
                      onBook={c => handleBookCar(c)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews, Categories & FAQ */}
            <ReviewsAndFaq
              onSelectCategory={handleSelectCategoryFromHome}
              onContactClick={() => {
                setCurrentView('contact');
                window.location.hash = 'contact';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {currentView === 'cars' && (
          <CarsCatalog
            initialCategory={catalogCategory}
            initialSearch={catalogSearch}
            onSelectCar={c => handleOpenCarPage(c)}
            onBookCar={c => handleBookCar(c)}
          />
        )}

        {/* Dedicated Full Car Details Page (Not a popup) */}
        {currentView === 'car-details' && selectedCar && (
          <CarDetailsPage
            car={selectedCar}
            onBack={() => {
              setCurrentView('cars');
              window.location.hash = 'cars';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBook={(c, dates) => handleBookCar(c, dates)}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorks
            onBrowseFleet={() => {
              setCatalogCategory('all');
              setCurrentView('cars');
              window.location.hash = 'cars';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'about' && (
          <AboutUs
            onBrowseFleet={() => {
              setCatalogCategory('all');
              setCurrentView('cars');
              window.location.hash = 'cars';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'contact' && <ContactUs />}

        {(currentView === 'customer-dashboard' || currentView === 'notifications') && (
          <CustomerDashboard
            onNavigateHome={() => {
              setCurrentView('cars');
              window.location.hash = 'cars';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onNavigateHome={() => {
              setCurrentView('home');
              window.location.hash = 'home';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPolicy={p => setPolicyModal(p)}
      />

      {/* Booking Form Sheet / Checkout Modal */}
      {selectedCarForBooking && (
        <BookingModal
          car={selectedCarForBooking}
          initialDates={searchDates}
          onClose={() => setSelectedCarForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      <AuthModal />
      <PoliciesModal type={policyModal} onClose={() => setPolicyModal(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
