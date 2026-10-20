import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import PolicySections from '../components/PolicySections';
import { useSiteSettings } from '../context/SiteDataContext';
import { usePageSEO } from '../hooks/usePageSEO';

const HouseRulesPage: React.FC = () => {
  usePageSEO({
    title: 'House Rules & Guest Policies | Lonavala Stays',
    description:
      'Review house rules for Lonavala Stays: standard check-in at 1:00 PM, check-out by 11:00 AM, occupancy limits, quiet hours, and property care guidelines.',
    canonical: 'https://lonavalastays.in/house-rules',
  });

  const settings = useSiteSettings();

  return (
    <PublicLayout currentPage="house-rules">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="font-heading text-4xl mb-3">House rules</h1>
        <p className="text-lg text-gray-700 mb-10">
          These rules apply to all villas managed by {settings.resortName}. Individual properties
          may have additional guidelines shown on the villa listing.
        </p>
        <PolicySections
          sections={settings.houseRulesSections}
          checkInTime={settings.checkInTime}
          checkOutTime={settings.checkOutTime}
        />
      </div>
    </PublicLayout>
  );
};

export default HouseRulesPage;
