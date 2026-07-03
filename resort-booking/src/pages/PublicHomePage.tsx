import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/ui/AnimatedSection';
import PublicLayout from '../components/layout/PublicLayout';
import HeroExplorer from '../components/home/HeroExplorer';
import FeaturedVillasSection from '../components/home/FeaturedVillasSection';
import WhyBookWithUsSection from '../components/home/WhyBookWithUsSection';
import NormalizedImage from '../components/ui/NormalizedImage';
import { formatSalePrice } from '../data/propertiesForSale';
import { useSiteCatalog, useSiteSettings } from '../context/SiteDataContext';
import { resolveExploreTileImage } from '../lib/exploreTileImages';
import { isForSaleEnabled } from '../lib/featureFlags';

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
            <h1 className="font-heading text-4xl md:text-6xl font-normal tracking-wide mb-4 motion-safe:animate-slide-up">
              {settings.heroTitle}
            </h1>
            <p className="section-lead text-2xl max-w-2xl mx-auto motion-safe:animate-fade-in [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
              {settings.heroSubtitle}
            </p>
          </div>
          <HeroExplorer />
        </div>
      </div>

      <FeaturedVillasSection rooms={featuredRooms} settings={settings} />

      <WhyBookWithUsSection />

      {isForSaleEnabled && featuredForSale.length > 0 && (
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-4xl font-normal tracking-wide mb-2">
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
                    <p className="villa-card-meta text-lg font-medium mb-2">{property.location}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {settings.exploreTiles
              .filter((item) => isForSaleEnabled || !item.path.startsWith('/for-sale'))
              .map((item, index) => (
              <AnimatedSection key={item.name} delay={index * 100} variant="scale-in">
                <Link to={item.path} className="explore-tile relative rounded-lg overflow-hidden group block">
                  <NormalizedImage
                    src={resolveExploreTileImage(item)}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="explore-tile-image w-full h-40 sm:h-32 object-cover"
                    fallback={resolveExploreTileImage({ ...item, image: '' })}
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
