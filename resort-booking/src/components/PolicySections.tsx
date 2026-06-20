import React from 'react';
import type { InfoSection } from '../types/site';

type PolicySectionsProps = {
  sections: InfoSection[];
  className?: string;
};

const PolicySections: React.FC<PolicySectionsProps> = ({ sections, className = '' }) => {
  if (!sections.length) return null;

  return (
    <div className={`space-y-8 ${className}`}>
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="font-heading text-xl text-gray-900 mb-3">{section.title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-gray-800 leading-relaxed">
            {section.items.filter(Boolean).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default PolicySections;
