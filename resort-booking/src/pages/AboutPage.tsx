import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import NormalizedImage from '../components/ui/NormalizedImage';
import Button from '../components/ui/Button';
import { useSiteData } from '../context/SiteDataContext';

const AboutPage: React.FC = () => {
  const { settings } = useSiteData();

  return (
    <PublicLayout currentPage="about">
      <section className="relative bg-white overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <AnimatedSection variant="slide-right">
              <h1 className="font-heading text-4xl md:text-5xl mb-4">About {settings.resortName}</h1>
              {settings.aboutParagraphs.map((para, i) => (
                <p key={i} className={i === 0 ? 'text-2xl text-gray-900 mb-4' : 'text-xl text-gray-900 mb-4'}>
                  {para}
                </p>
              ))}
            </AnimatedSection>
            <AnimatedSection variant="scale-in" delay={150}>
              <NormalizedImage
                src={settings.aboutImage}
                fallback="https://via.placeholder.com/900x600?text=About"
                alt="Luxury villa in Lonavala hills"
                className="rounded-2xl shadow-card-hover w-full h-80 object-cover"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <AnimatedSection className="text-center mb-10">
          <h2 className="font-heading text-3xl mb-2">What makes us different</h2>
          <p className="text-xl text-gray-900">Many villas. One team. Handpicked hill escapes.</p>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {settings.aboutHighlights.map((item, index) => (
            <AnimatedSection key={item.title} delay={index * 120}>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full hover:shadow-card-hover transition-shadow duration-300">
                <h3 className="font-heading text-xl mb-3 uppercase tracking-wide">{item.title}</h3>
                <p className="text-lg text-gray-900">{item.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="font-heading text-3xl mb-4">Plan your stay</h2>
            <p className="text-xl text-gray-900 mb-8 max-w-xl mx-auto">
              Browse our villas, compare locations and amenities, or contact us—we will help you pick the right property.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/villas">
                <Button size="lg" className="rounded-full btn-primary-motion">View villas</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="rounded-full">
                  Contact us
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;
