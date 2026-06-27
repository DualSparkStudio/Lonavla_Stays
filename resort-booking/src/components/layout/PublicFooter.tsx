import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useSiteSettings } from '../../context/SiteDataContext';
import { isForSaleEnabled } from '../../lib/featureFlags';

const footerLinks = [
  { name: 'Villas', path: '/villas' },
  { name: 'For Sale', path: '/for-sale', forSaleOnly: true },
  { name: 'Facilities', path: '/facilities' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'House rules', path: '/house-rules' },
  { name: 'Terms & conditions', path: '/terms' },
] as const;

const PublicFooter: React.FC = () => {
  const settings = useSiteSettings();

  return (
    <footer className="bg-gray-50 text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-3">
              <BrandLogo
                name={settings.resortName}
                showName
                variant="mark"
                size="footer"
              />
            </Link>
            <p className="text-gray-900 mb-4 mt-3 max-w-md">
              We manage and book a collection of private luxury villas across Lonavala—each property with its own address and character.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-lg mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks
                .filter((link) => isForSaleEnabled || !('forSaleOnly' in link && link.forSaleOnly))
                .map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-900 hover:text-airbnb-red transition-colors font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg mb-4 uppercase tracking-wide">Contact</h3>
            <div className="space-y-3 text-gray-900 font-medium">
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

        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left text-gray-900 text-base">
          <p>
            © {new Date().getFullYear()} {settings.resortName}. All rights reserved.{' '}
            <Link to="/terms" className="text-airbnb-red hover:underline font-medium">
              Terms &amp; conditions
            </Link>
          </p>
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
