import React, { useMemo } from 'react';
import { resolvePolicySections } from '../lib/policySections';
import type { InfoSection } from '../types/site';

type PolicySectionsProps = {
  sections: InfoSection[];
  className?: string;
  /** When set, check-in/out lines in house rules use admin booking defaults. */
  checkInTime?: string;
  checkOutTime?: string;
};

const PolicySections: React.FC<PolicySectionsProps> = ({
  sections,
  className = '',
  checkInTime,
  checkOutTime,
}) => {
  const resolvedSections = useMemo(() => {
    if (!checkInTime && !checkOutTime) return sections;
    return resolvePolicySections(sections, checkInTime ?? '', checkOutTime ?? '');
  }, [sections, checkInTime, checkOutTime]);

  if (!resolvedSections.length) return null;

  return (
    <div className={`space-y-8 ${className}`}>
      {resolvedSections.map((section) => (
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
