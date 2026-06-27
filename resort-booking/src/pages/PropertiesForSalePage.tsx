import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import { useSiteSettings } from '../context/SiteDataContext';

const COMING_SOON_FEATURES = [
  { icon: '📍', label: 'Premium NA Plots' },
  { icon: '🏡', label: 'Villas for Sale' },
  { icon: '💰', label: 'Investment Opportunities' },
] as const;

const FOR_SALE_SITE_URL = 'https://lonavalastays.in/';
const FOR_SALE_FALLBACK_PHONE = '+91 70403 36832';

const PropertiesForSalePage: React.FC = () => {
  const settings = useSiteSettings();
  const contactPhone = settings.resortPhone.trim() || FOR_SALE_FALLBACK_PHONE;
  const phoneHref = `tel:${contactPhone.replace(/\s/g, '')}`;

  return (
    <PublicLayout currentPage="for-sale">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AnimatedSection>
            <h1 className="font-heading text-4xl md:text-5xl mb-3">
              {settings.forSalePageTitle}
            </h1>
            <p className="section-lead text-2xl max-w-2xl">
              {settings.forSalePageSubtitle}
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <AnimatedSection>
          <div className="rounded-2xl border border-airbnb-red/25 bg-gradient-to-b from-pink-50/80 to-white p-8 md:p-12 text-center shadow-sm">
            <p className="text-4xl md:text-5xl mb-4" aria-hidden>
              🚧
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-4">Coming Soon!</h2>
            <p className="section-lead text-xl md:text-2xl mb-8 max-w-xl mx-auto">
              We&apos;re currently working on our Buy Plots &amp; Villas section to bring you the best
              investment opportunities in Lonavala.
            </p>

            <ul className="space-y-3 mb-10 text-left max-w-md mx-auto">
              {COMING_SOON_FEATURES.map((item) => (
                <li
                  key={item.label}
                  className="section-lead text-xl flex items-center gap-3"
                >
                  <span className="text-2xl shrink-0" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-left max-w-md mx-auto">
              <p className="section-lead text-lg md:text-xl mb-4">
                For early access or enquiries, please contact us:
              </p>
              <ul className="space-y-3 section-lead text-lg md:text-xl">
                <li className="flex items-start gap-2">
                  <span aria-hidden>📞</span>
                  <a
                    href={phoneHref}
                    className="phone-number text-airbnb-red hover:underline font-medium"
                  >
                    {contactPhone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>🌐</span>
                  <a
                    href={FOR_SALE_SITE_URL}
                    className="text-airbnb-red hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {FOR_SALE_SITE_URL}
                  </a>
                </li>
              </ul>
            </div>

            <p className="font-heading text-2xl md:text-3xl mt-10 text-airbnb-red tracking-wide">
              Stay tuned – Launching Soon!
            </p>

            <Link
              to="/contact?subject=purchase"
              className="inline-flex items-center mt-8 rounded-full bg-airbnb-red px-6 py-3 text-white search-tab hover:bg-airbnb-red-dark btn-primary-motion"
            >
              Get in touch
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </PublicLayout>
  );
};

export default PropertiesForSalePage;
