import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/ui/AnimatedSection';
import PublicLayout from '../components/layout/PublicLayout';
import HeroExplorer from '../components/home/HeroExplorer';
import NormalizedImage from '../components/ui/NormalizedImage';
import { formatSalePrice } from '../data/propertiesForSale';
import { useSiteCatalog, useSiteSettings } from '../context/SiteDataContext';

const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const { rooms, propertiesForSale } = useSiteCatalog();

  const featuredRooms = useMemo(
    () => rooms.filter((room) => room.status === 'available'),
    [rooms],
  );

  const featuredForSale = useMemo(
    () => propertiesForSale.filter((p) => p.status === 'available').slice(0, 3),
    [propertiesForSale],
  );

  return (
    <PublicLayout currentPage="home">
      <div className="relative bg-white overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl md:text-6xl font-normal tracking-wide text-gray-900 mb-4 motion-safe:animate-slide-up">
              {settings.heroTitle}
            </h1>
            <p className="text-2xl text-gray-900 max-w-2xl mx-auto motion-safe:animate-fade-in [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
              {settings.heroSubtitle}
            </p>
          </div>
          <HeroExplorer />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatedSection>
          <h2 className="font-heading text-4xl font-normal tracking-wide text-gray-900 mb-2">Featured villas</h2>
          <p className="text-2xl text-gray-900 mb-8 max-w-2xl">
            {settings.brandTagline}. Every card is a separate villa we manage—tap to see location, amenities, and rates.
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredRooms.map((room, index) => (
            <AnimatedSection key={room.id} delay={index * 120} variant="fade-up">
              <div
                className="room-card bg-white rounded-xl overflow-hidden shadow-md cursor-pointer border border-gray-100 h-full"
                onClick={() => navigate(`/villas/${room.id}`)}
              >
                <div className="relative overflow-hidden">
                  <NormalizedImage
                    urls={room.images}
                    fallback="https://via.placeholder.com/800x600?text=Villa"
                    alt={room.name}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="room-card-image w-full h-56 object-cover"
                  />
                  <span className="villa-card-tag absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-base font-bold">
                    {room.room_type}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg text-airbnb-red leading-snug uppercase tracking-wide">{room.name}</h3>
                  <p className="text-gray-900 text-lg font-medium mb-2 mt-2">
                    {room.location} · {room.max_guests} guests included
                  </p>
                  <p className="text-gray-900 text-lg mb-3 line-clamp-2">{room.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="villa-card-price">₹{room.price_per_night.toLocaleString('en-IN')}</span>
                      <span className="text-gray-900 text-xl"> / night</span>
                    </div>
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

      {featuredForSale.length > 0 && (
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-4xl font-normal tracking-wide text-gray-900 mb-2">
              Plots &amp; villas for sale
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredForSale.map((property, index) => (
              <AnimatedSection key={property.id} delay={index * 120} variant="fade-up">
                <div
                  className="room-card bg-white rounded-xl overflow-hidden shadow-md cursor-pointer border border-gray-100 h-full"
                  onClick={() => navigate(`/for-sale/${property.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <NormalizedImage
                    urls={property.images}
                    fallback="https://via.placeholder.com/800x600?text=Property"
                    alt={property.title}
                    loading="lazy"
                    decoding="async"
                    className="room-card-image w-full h-56 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-heading text-lg text-airbnb-red uppercase tracking-wide mb-2">{property.title}</h3>
                    <p className="text-gray-900 text-lg font-medium mb-2">{property.location}</p>
                    <span className="font-bold text-2xl villa-card-price">{formatSalePrice(property)}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
      )}

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.exploreTiles.map((item, index) => (
              <AnimatedSection key={item.name} delay={index * 100} variant="scale-in">
                <Link to={item.path} className="explore-tile relative rounded-lg overflow-hidden group block">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="explore-tile-image w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/25 flex items-center justify-center p-3">
                    <span className="text-white font-heading text-base uppercase tracking-wide text-center">
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

export default PublicHomePage;
