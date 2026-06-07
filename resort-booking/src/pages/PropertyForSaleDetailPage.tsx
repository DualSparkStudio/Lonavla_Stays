import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  MapPinIcon,
  PhoneIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';
import LocationMapSection from '../components/maps/LocationMapSection';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import Button from '../components/ui/Button';
import {
  formatSalePrice,
  getCategoryLabel,
  getStatusLabel,
} from '../data/propertiesForSale';
import { useSiteData } from '../context/SiteDataContext';
import { buildPropertyEnquiryMessage, buildWhatsAppUrl } from '../lib/whatsapp';

const PropertyForSaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const { getPropertyForSaleById, settings } = useSiteData();

  const property = id ? getPropertyForSaleById(id) : undefined;

  if (!property) {
    return (
      <PublicLayout currentPage="for-sale">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl text-gray-900 mb-4">Property not found</h1>
          <Link to="/for-sale" className="text-airbnb-red font-bold hover:underline">
            ← Back to all listings
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const nextImage = () => setImageIndex((i) => (i + 1) % property.images.length);
  const prevImage = () =>
    setImageIndex((i) => (i - 1 + property.images.length) % property.images.length);

  const whatsappPhone = settings.resortPhone.trim();
  const whatsappHref = buildWhatsAppUrl(
    whatsappPhone,
    buildPropertyEnquiryMessage(property.title),
  );
  const phoneHref = `tel:${whatsappPhone.replace(/\s/g, '')}`;

  return (
    <PublicLayout currentPage="for-sale">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate('/for-sale')}
          className="inline-flex items-center gap-2 text-gray-900 hover:text-airbnb-red font-bold mb-6 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          All listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection variant="fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={property.images[imageIndex]}
                  alt={property.title}
                  className="w-full h-80 md:h-[28rem] object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:scale-105 transition-transform text-2xl leading-none"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:scale-105 transition-transform text-2xl leading-none"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === imageIndex ? 'border-airbnb-red' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-base font-bold text-gray-800">
                  {getCategoryLabel(property.category)}
                </span>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-base font-bold ${
                    property.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {getStatusLabel(property.status)}
                </span>
              </div>
              <h1 className="font-heading text-4xl text-gray-900 mb-2">{property.title}</h1>
              <p className="flex items-start gap-2 text-xl text-gray-900 mb-2">
                <MapPinIcon className="h-5 w-5 shrink-0 mt-0.5 text-airbnb-red" />
                <span>
                  {property.location}
                  <span className="block text-lg text-gray-900 mt-1">{property.address}</span>
                </span>
              </p>
              <p className="flex items-center gap-2 text-lg text-gray-900 font-medium mb-6">
                <HomeModernIcon className="h-5 w-5 text-airbnb-red" />
                {property.areaLabel}
                {property.bedrooms != null && (
                  <span className="text-gray-400">·</span>
                )}
                {property.bedrooms != null && (
                  <span>
                    {property.bedrooms} bed · {property.bathrooms} bath
                  </span>
                )}
              </p>
              <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-line">
                {property.longDescription}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <h2 className="font-heading text-2xl text-gray-900 mb-4">Highlights</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-base font-medium text-gray-700"
                  >
                    <span className="text-airbnb-red">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <LocationMapSection
                mapEmbedUrl={property.mapEmbedUrl}
                address={property.address}
                location={property.location}
              />
            </AnimatedSection>
          </div>

          <AnimatedSection delay={200} variant="slide-left" className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Asking price
                </p>
                <p className="text-3xl font-bold text-gray-900">{formatSalePrice(property)}</p>
              </div>

              <p className="text-lg text-gray-900">
                Interested in this {property.category === 'villa' ? 'villa' : 'plot'}? Contact{' '}
                {settings.resortName} for site visits, title documents, and negotiation support.
              </p>

              <a
                href={whatsappHref || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={whatsappHref ? 'block' : 'block pointer-events-none opacity-50'}
                aria-disabled={!whatsappHref}
              >
                <Button fullWidth size="lg" className="rounded-full btn-primary-motion mb-3">
                  Enquire to buy
                </Button>
              </a>

              <a href={phoneHref} className="block">
                <Button variant="outline" fullWidth size="lg" className="rounded-full">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Call {whatsappPhone}
                </Button>
              </a>

              <p className="text-xs text-gray-500 text-center pt-2">
                Reference: {property.id.toUpperCase()}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PropertyForSaleDetailPage;
