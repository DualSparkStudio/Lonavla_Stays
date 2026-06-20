import React from 'react';
import AdminFormField, { adminInputClass } from './AdminFormField';
import type { InfoSection } from '../../types/site';

type InfoSectionsEditorProps = {
  sections: InfoSection[];
  onChange: (sections: InfoSection[]) => void;
  addLabel?: string;
};

const emptySection = (): InfoSection => ({ title: '', items: [''] });

const InfoSectionsEditor: React.FC<InfoSectionsEditorProps> = ({
  sections,
  onChange,
  addLabel = 'Add section',
}) => {
  const updateSection = (index: number, patch: Partial<InfoSection>) => {
    onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <AdminFormField label={`Section ${index + 1} title`} className="flex-1 mb-0">
              <input
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
                className={adminInputClass}
                placeholder="e.g. Check-in & check-out"
              />
            </AdminFormField>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="mt-7 text-sm font-medium text-red-600 hover:text-red-700 shrink-0"
            >
              Remove
            </button>
          </div>
          <AdminFormField label="Bullet points" hint="One rule or paragraph per line">
            <textarea
              value={section.items.join('\n')}
              onChange={(e) =>
                updateSection(index, {
                  items: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                })
              }
              rows={4}
              className={adminInputClass}
            />
          </AdminFormField>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...sections, emptySection()])}
        className="text-sm font-semibold text-red-600 hover:text-red-700"
      >
        + {addLabel}
      </button>
    </div>
  );
};

export default InfoSectionsEditor;
