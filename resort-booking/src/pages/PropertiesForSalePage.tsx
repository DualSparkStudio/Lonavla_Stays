import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import {
  formatSalePrice,
  getCategoryLabel,
  getStatusLabel,
  type PropertyCategory,
} from '../data/propertiesForSale';
import { useSiteData } from '../context/SiteDataContext';
import { getPrimaryImage } from '../lib/imageUrl';
import { cn } from '../utils/cn';

type CategoryFilter = 'all' | PropertyCategory;

const PropertiesForSalePage: React.FC = () => {
  const { propertiesForSale, settings } = useSiteData();
  const [searchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('price-desc');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category === 'villa' || category === 'plot') {
      setCategoryFilter(category);
    }
    const area = searchParams.get('area');
    if (area) setAreaFilter(area);
  }, [searchParams]);

  const listings = useMemo(() => {
    let list = propertiesForSale.filter((p) => p.status !== 'sold');
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (areaFilter !== 'all') {
      list = list.filter((p) => p.location === areaFilter);
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') {
        const pa = a.priceOnRequest ? Infinity : a.price;
        const pb = b.priceOnRequest ? Infinity : b.price;
        return pa - pb;
      }
      if (sortBy === 'price-desc') {
        const pa = a.priceOnRequest ? -1 : a.price;
        const pb = b.priceOnRequest ? -1 : b.price;
        return pb - pa;
      }
      return 0;
    });
  }, [categoryFilter, areaFilter, sortBy, propertiesForSale]);

  const saleAreas = ['all', ...Array.from(new Set(propertiesForSale.map((p) => p.location)))];

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All listings' },
    { key: 'villa', label: 'Villas' },
    { key: 'plot', label: 'Plots' },
  ];

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
            {(categoryFilter !== 'all' || areaFilter !== 'all') && (
              <p className="mt-3 text-lg font-medium text-airbnb-red">
                Filtered:
                {categoryFilter !== 'all' ? ` ${categoryFilter === 'villa' ? 'Villas' : 'Plots'}` : ''}
                {areaFilter !== 'all' ? ` · ${areaFilter}` : ''}
              </p>
            )}
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setCategoryFilter(filter.key)}
                className={cn(
                  'rounded-full px-4 py-2 text-base font-bold transition-all duration-200',
                  categoryFilter === filter.key
                    ? 'bg-airbnb-red text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-airbnb-red hover:text-airbnb-red'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-lg font-medium bg-white focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
          >
            {saleAreas.map((area) => (
              <option key={area} value={area}>
                {area === 'all' ? 'All areas' : area}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-lg font-medium bg-white focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
          >
            <option value="price-desc">Price: high to low</option>
            <option value="price-asc">Price: low to high</option>
            <option value="newest">Featured</option>
          </select>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 text-gray-900">
            <p className="text-xl font-medium">No listings in this category right now.</p>
            <Link to="/contact" className="inline-block mt-4 text-airbnb-red font-bold hover:underline">
              Contact us for off-market options →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {listings.map((property, index) => (
              <AnimatedSection key={property.id} delay={index * 100}>
                <Link
                  to={`/for-sale/${property.id}`}
                  className="room-card block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-md h-full"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getPrimaryImage(property.images, 'https://via.placeholder.com/800x600?text=Property')}
                      alt={property.title}
                      className="room-card-image w-full h-72 object-cover"
                    />
                    <span className="villa-card-tag absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-base font-bold">
                      {getCategoryLabel(property.category)}
                    </span>
                    {property.status !== 'available' && (
                      <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white uppercase">
                        {getStatusLabel(property.status)}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="font-heading text-xl text-airbnb-red uppercase tracking-wide mb-2">
                      {property.title}
                    </h2>
                    <p className="villa-card-meta text-lg font-medium mb-1">{property.location}</p>
                    <p className="villa-card-meta text-base mb-3">{property.areaLabel}</p>
                    <p className="villa-card-body text-lg mb-4 line-clamp-2">{property.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.highlights.slice(0, 3).map((h) => (
                        <span
                          key={h}
                          className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="villa-card-price">
                        {formatSalePrice(property)}
                      </span>
                      <span className="text-airbnb-red font-bold text-base">View details →</span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}

        <AnimatedSection delay={300} className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="font-heading text-2xl mb-2">Looking for something specific?</h2>
          <p className="text-xl text-gray-900 mb-6 max-w-xl mx-auto">
            Tell us your budget, preferred location, and whether you need a plot or villa—we&apos;ll share
            matching options and arrange site visits.
          </p>
          <Link
            to="/contact?subject=purchase"
            className="inline-flex items-center rounded-full bg-airbnb-red px-6 py-3 text-white font-bold hover:bg-airbnb-red-dark btn-primary-motion"
          >
            Speak to our sales team
          </Link>
        </AnimatedSection>
      </div>
    </PublicLayout>
  );
};

export default PropertiesForSalePage;
