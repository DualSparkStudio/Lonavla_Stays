import React from 'react';
import {
  BuildingOffice2Icon,
  CurrencyRupeeIcon,
  BoltIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import AnimatedSection from '../ui/AnimatedSection';

const HIGHLIGHTS = [
  {
    title: 'Curated Villas',
    description:
      'Handpicked luxury villas across Lonavala with stunning views, private pools, and modern amenities.',
    Icon: BuildingOffice2Icon,
  },
  {
    title: 'Best Price Guarantee',
    description: 'Get the best rates on every villa booking—transparent pricing with no hidden surprises.',
    Icon: CurrencyRupeeIcon,
  },
  {
    title: 'Instant Confirmation',
    description: 'Book now and receive instant booking confirmation so you can plan your trip with confidence.',
    Icon: BoltIcon,
  },
  {
    title: '24x7 Support',
    description: 'Round-the-clock support for all your booking needs—from enquiry to check-out.',
    Icon: PhoneIcon,
  },
] as const;

const WhyBookWithUsSection: React.FC = () => (
  <section className="bg-white border-t border-gray-100 py-14 sm:py-16" aria-labelledby="why-book-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h2
          id="why-book-heading"
          className="font-heading text-3xl sm:text-4xl font-normal tracking-wide text-center mb-10 sm:mb-12"
        >
          Why guests love booking with us
        </h2>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {HIGHLIGHTS.map(({ title, description, Icon }, index) => (
          <AnimatedSection key={title} delay={index * 80} variant="fade-up">
            <div className="h-full rounded-2xl bg-airbnb-red/10 border border-airbnb-red/15 px-5 py-6 sm:px-6 sm:py-7 text-center sm:text-left transition-shadow hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-airbnb-red text-white mb-4">
                <Icon className="w-6 h-6" aria-hidden />
              </div>
              <h3 className="font-heading text-lg sm:text-xl text-airbnb-red tracking-wide mb-2">{title}</h3>
              <p className="text-gray-700 text-base leading-relaxed">{description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default WhyBookWithUsSection;
