import React from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import PolicySections from '../components/PolicySections';
import { getTermsSections } from '../lib/policySections';
import { useSiteSettings } from '../context/SiteDataContext';

const TermsAndConditionsPage: React.FC = () => {
  const settings = useSiteSettings();
  const sections = getTermsSections(settings);

  return (
    <PublicLayout currentPage="terms">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="font-heading text-4xl mb-3">Terms &amp; conditions</h1>
        <p className="text-lg text-gray-700 mb-10">
          Please read these terms before booking a stay with {settings.resortName}. For questions,
          contact us at{' '}
          <a href={`mailto:${settings.resortEmail}`} className="text-airbnb-red font-semibold hover:underline">
            {settings.resortEmail}
          </a>
          .
        </p>
        <PolicySections sections={sections} />
      </div>
    </PublicLayout>
  );
};

export default TermsAndConditionsPage;
