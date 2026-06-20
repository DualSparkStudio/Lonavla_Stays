import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';
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
const AdminOtherPage = lazy(() => import('./pages/admin/AdminOtherPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const HouseRulesPage = lazy(() => import('./pages/HouseRulesPage'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center text-gray-900">Loading…</div>
);

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
          <Route path="/terms" element={<TermsAndConditionsPage />} />
          <Route path="/house-rules" element={<HouseRulesPage />} />
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
            <Route path="/admin/other" element={<AdminOtherPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-900 mb-6">Page not found</p>
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
