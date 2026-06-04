import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSiteData } from '../../context/SiteDataContext';

const AdminDashboardPage: React.FC = () => {
  const { rooms, propertiesForSale, bookings, contactMessages, facilities } = useSiteData();

  const availableVillas = rooms.filter((r) => r.status === 'available').length;
  const saleListings = propertiesForSale.filter((p) => p.status !== 'sold').length;

  return (
    <AdminLayout currentPage="dashboard">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">All public website content is managed from this panel and saved to your browser.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Villas', value: rooms.length, sub: `${availableVillas} available`, to: '/admin/rooms' },
          { label: 'For sale', value: saleListings, sub: 'active listings', to: '/admin/for-sale' },
          { label: 'Facilities', value: facilities.length, sub: 'items', to: '/admin/facilities' },
          { label: 'Bookings', value: bookings.length, sub: 'records', to: '/admin/bookings' },
          { label: 'Messages', value: contactMessages.length, sub: 'unread enquiries', to: '/admin/messages' },
        ].map((card) => (
          <Link key={card.label} to={card.to} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-pink-600">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4">Quick links</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/settings" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">Edit site content</Link>
          <Link to="/" className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">View live site</Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
