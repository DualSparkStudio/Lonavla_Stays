import React from 'react';

export const adminInputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500';

type AdminFormFieldProps = {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

const AdminFormField: React.FC<AdminFormFieldProps> = ({ label, hint, className, children }) => (
  <div className={className}>
    <label className="block text-base font-semibold text-pink-600 mb-1">{label}</label>
    {children}
    {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
  </div>
);

export default AdminFormField;
