import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteDataContext';

const PublicFooter: React.FC = () => {
  const settings = useSiteSettings();

  return (
    <footer className="bg-gray-50 text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-heading text-xl text-[#FF385C] uppercase tracking-wide">{settings.resortName}</span>
            <p className="text-gray-600 mb-4 mt-3 max-w-md">
              We manage and book a collection of private luxury villas across Lonavala—each property with its own address and character.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-lg mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Villas', path: '/villas' },
                { name: 'For Sale', path: '/for-sale' },
                { name: 'Facilities', path: '/facilities' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-600 hover:text-airbnb-red transition-colors font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg mb-4 uppercase tracking-wide">Contact</h3>
            <div className="space-y-3 text-gray-600 font-medium">
              {settings.resortAddress.trim() ? (
                <p>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                    Office
                  </span>
                  {settings.resortAddress}
                </p>
              ) : null}
              {settings.resortPhone.trim() ? (
                <p>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                    Phone / WhatsApp
                  </span>
                  <a href={`tel:${settings.resortPhone.replace(/\s/g, '')}`} className="hover:text-airbnb-red transition-colors">
                    {settings.resortPhone}
                  </a>
                </p>
              ) : null}
              {settings.resortEmail.trim() ? (
                <p>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                    Email
                  </span>
                  <a href={`mailto:${settings.resortEmail}`} className="hover:text-airbnb-red transition-colors">
                    {settings.resortEmail}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} {settings.resortName}. All rights reserved.</p>
          <p>
            Crafted by{' '}
            <a
              href="https://dualsparkstudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#FF385C] hover:text-[#E31C5F] transition-colors duration-200"
            >
              DualSpark Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
