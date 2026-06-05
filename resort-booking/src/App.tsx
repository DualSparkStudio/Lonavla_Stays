import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';
<<<<<<< HEAD
=======
import { formatSalePrice, getCategoryLabel } from './data/propertiesForSale';
import { useSiteData } from './context/SiteDataContext';
import { getPrimaryImage } from './lib/imageUrl';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSiteSettingsPage from './pages/admin/AdminSiteSettingsPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminForSalePage from './pages/admin/AdminForSalePage';
import AdminFacilitiesPage from './pages/admin/AdminFacilitiesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
>>>>>>> 5e587cefe66a7c5507e46cb8d4381a083fcda235
import AdminRoute from './components/admin/AdminRoute';

const PublicHomePage = lazy(() => import('./pages/PublicHomePage'));
const PublicLoginPage = lazy(() => import('./pages/PublicLoginPage'));
const RoomsPage = lazy(() => import('./pages/RoomsPage'));
const RoomDetailPage = lazy(() => import('./pages/RoomDetailPage'));
const FacilitiesPage = lazy(() => import('./pages/FacilitiesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const UserBookingsPage = lazy(() => import('./pages/UserBookingsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'));
const PropertiesForSalePage = lazy(() => import('./pages/PropertiesForSalePage'));
const PropertyForSaleDetailPage = lazy(() => import('./pages/PropertyForSaleDetailPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminSiteSettingsPage = lazy(() => import('./pages/admin/AdminSiteSettingsPage'));
const AdminRoomsPage = lazy(() => import('./pages/admin/AdminRoomsPage'));
const AdminForSalePage = lazy(() => import('./pages/admin/AdminForSalePage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminCalendarPage = lazy(() => import('./pages/admin/AdminCalendarPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));

<<<<<<< HEAD
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading…</div>
);
=======
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isSignUp) {
      // Sign up validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      // Check if signing up with admin email
      const isAdminEmail = formData.email.toLowerCase().includes('admin');
      if (isAdminEmail) {
        setSuccess('Admin account created successfully! You can now sign in with admin privileges.');
      } else {
        setSuccess('Account created successfully! You can now sign in.');
      }
      setIsSignUp(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', confirmPassword: '' });
    } else {
      // Sign in - demo functionality with admin check
      if (formData.email === 'user@demo.com' && formData.password === 'demo123') {
        setSuccess('Welcome back! Redirecting to dashboard...');
        setTimeout(() => navigate('/bookings'), 2000);
      } else if (formData.email === 'admin@demo.com' && formData.password === 'admin123') {
        adminLogin();
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid email or password. Try: user@demo.com/demo123 or admin@demo.com/admin123');
      }
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🏨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {isSignUp ? 'Join ResortStay to book your perfect getaway' : 'Sign in to your ResortStay account'}
          </p>
          {isSignUp && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Use an email containing "admin" to create an admin account
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
              setFormData({ email: '', password: '', firstName: '', lastName: '', confirmPassword: '' });
            }}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {!isSignUp && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <strong>👤 User Demo Login:</strong><br />
                Email: <code className="bg-white px-1 rounded">user@demo.com</code><br />
                Password: <code className="bg-white px-1 rounded">demo123</code>
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 text-center">
                <strong>🔐 Admin Demo Login:</strong><br />
                Email: <code className="bg-white px-1 rounded">admin@demo.com</code><br />
                Password: <code className="bg-white px-1 rounded">admin123</code>
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <Link to="/" className="block text-gray-500 hover:text-gray-700 text-sm font-medium">
            ← Back to Home
          </Link>
          <Link to="/admin/login" className="block text-red-500 hover:text-red-600 text-sm font-medium">
            🔐 Admin Login Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
// HomePage Component
const HomePage = () => {
  const navigate = useNavigate();
  const { settings, rooms, propertiesForSale } = useSiteData();

  const handleRoomClick = (roomId: string) => {
    navigate(`/villas/${roomId}`);
  };

  return (
    <PublicLayout currentPage="home">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl md:text-6xl font-normal tracking-wide text-gray-900 mb-4 motion-safe:animate-slide-up">
              {settings.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto motion-safe:animate-fade-in [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
              {settings.heroSubtitle}
            </p>
          </div>

          <HeroExplorer />
        </div>
      </div>

      {/* Villas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatedSection>
          <h2 className="font-heading text-4xl font-normal tracking-wide text-gray-900 mb-2">Featured villas</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            {settings.brandTagline}. Every card is a separate villa we manage—tap to see location, amenities, and rates.
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.filter((room) => room.status === 'available').map((room, index) => (
            <AnimatedSection key={room.id} delay={index * 120} variant="fade-up">
            <div
              className="room-card bg-white rounded-xl overflow-hidden shadow-md cursor-pointer border border-gray-100 h-full"
              onClick={() => handleRoomClick(room.id)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={getPrimaryImage(room.images, 'https://via.placeholder.com/800x600?text=Villa')}
                  alt={room.name}
                  className="room-card-image w-full h-56 object-cover"
                />
                <span className="villa-card-tag absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold">
                  {room.room_type}
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-heading text-lg text-gray-900 leading-snug uppercase tracking-wide">{room.name}</h3>
                  <div className="flex items-center text-base shrink-0">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{room.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-base font-medium mb-2">
                  {room.location} · Up to {room.max_guests} guests
                </p>
                <p className="text-gray-500 text-base mb-3 line-clamp-2">{room.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold villa-card-price">₹{room.price_per_night.toLocaleString('en-IN')}</span>
                    <span className="text-gray-600 text-base"> / night</span>
                  </div>
                  <span className="text-base text-gray-500">{room.review_count} reviews</span>
                </div>
              </div>
            </div>
            </AnimatedSection>
          ))}
        </div>
        <AnimatedSection delay={200} className="text-center mt-10">
          <button
            type="button"
            onClick={() => navigate('/villas')}
            className="inline-flex items-center rounded-full bg-airbnb-red px-6 py-3 text-white font-bold hover:bg-airbnb-red-dark btn-primary-motion"
          >
            View all villas
          </button>
        </AnimatedSection>
      </div>

      {/* Plots & villas for sale */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-4xl font-normal tracking-wide text-gray-900 mb-2">
              Plots &amp; villas for sale
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Looking to own in Lonavala? Explore NA plots and ready villas with full photo galleries—contact
              us directly to buy.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesForSale
              .filter((p) => p.status === 'available')
              .slice(0, 3)
              .map((property, index) => (
                <AnimatedSection key={property.id} delay={index * 120} variant="fade-up">
                  <div
                    className="room-card bg-white rounded-xl overflow-hidden shadow-md cursor-pointer border border-gray-100 h-full"
                    onClick={() => navigate(`/for-sale/${property.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/for-sale/${property.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getPrimaryImage(property.images, 'https://via.placeholder.com/800x600?text=Property')}
                        alt={property.title}
                        className="room-card-image w-full h-56 object-cover"
                      />
                      <span className="villa-card-tag absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold">
                        {getCategoryLabel(property.category)}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg text-gray-900 leading-snug uppercase tracking-wide mb-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-base font-medium mb-2">{property.location}</p>
                      <p className="text-gray-500 text-base mb-3 line-clamp-2">{property.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg villa-card-price">{formatSalePrice(property)}</span>
                        <span className="text-airbnb-red font-bold text-sm">View details →</span>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
          </div>
          <AnimatedSection delay={200} className="text-center mt-10">
            <button
              type="button"
              onClick={() => navigate('/for-sale')}
              className="inline-flex items-center rounded-full border-2 border-airbnb-red text-airbnb-red px-6 py-3 font-bold hover:bg-airbnb-red hover:text-white transition-colors btn-primary-motion"
            >
              View all properties for sale
            </button>
          </AnimatedSection>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection variant="fade-in">
            <h2 className="font-heading text-3xl font-normal tracking-wide text-gray-900 mb-8 text-center">
              Explore our stays
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.exploreTiles.map((item, index) => (
              <AnimatedSection key={item.name} delay={index * 100} variant="scale-in">
              <Link
                to={item.path}
                className="explore-tile relative rounded-lg overflow-hidden cursor-pointer group block"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="explore-tile-image w-full h-32 object-cover transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25 group-hover:from-black/90 group-hover:via-black/60 transition-colors duration-300 flex items-center justify-center p-3">
                  <span className="explore-tile-label text-white font-heading text-base sm:text-lg uppercase tracking-wide text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                    {item.name}
                  </span>
                </div>
              </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
      
    </PublicLayout>
  );
};

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});
>>>>>>> 5e587cefe66a7c5507e46cb8d4381a083fcda235

const LegacyRoomRedirect = () => {
  const { id } = useParams();
  return <Navigate to={id ? `/villas/${id}` : '/villas'} replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/rooms" element={<Navigate to="/villas" replace />} />
          <Route path="/rooms/:id" element={<LegacyRoomRedirect />} />
          <Route path="/villas" element={<RoomsPage />} />
          <Route path="/villas/:id" element={<RoomDetailPage />} />
          <Route path="/for-sale" element={<PropertiesForSalePage />} />
          <Route path="/for-sale/:id" element={<PropertyForSaleDetailPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking/confirmation/:bookingRef" element={<BookingConfirmationPage />} />
          <Route path="/booking/:roomId" element={<BookingPage />} />
          <Route path="/bookings" element={<UserBookingsPage />} />
          <Route path="/login" element={<PublicLoginPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/settings" element={<AdminSiteSettingsPage />} />
            <Route path="/admin/rooms" element={<AdminRoomsPage />} />
            <Route path="/admin/for-sale" element={<AdminForSalePage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/calendar" element={<AdminCalendarPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <Link to="/" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg">
                    Go back home
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
