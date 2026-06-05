import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type FieldProps = { label: string; value: React.ReactNode; className?: string };

export const AdminDetailField: React.FC<FieldProps> = ({ label, value, className }) => (
  <div className={className}>
    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
    <div className="bg-white rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm">
      {value}
    </div>
  </div>
);

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  tint: string;
  border: string;
  children: React.ReactNode;
};

export const AdminDetailSection: React.FC<SectionProps> = ({ title, icon, tint, border, children }) => (
  <section className={`rounded-xl border ${border} ${tint} p-4`}>
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h4 className="font-bold text-gray-900">{title}</h4>
    </div>
    {children}
  </section>
);

type AdminDetailModalShellProps = {
  open: boolean;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const AdminDetailModalShell: React.FC<AdminDetailModalShellProps> = ({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
}) => (
  <Transition appear show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <Dialog.Title className="font-heading text-2xl text-white tracking-wide truncate">
                      {title}
                    </Dialog.Title>
                    <p className="text-white/90 text-sm font-medium mt-0.5 uppercase tracking-wide">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-full p-1.5 text-white/90 hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                {footer}
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

export const statusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'occupied':
    case 'reserved':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'maintenance':
    case 'sold':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex capitalize px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(status)}`}>
    {status}
  </span>
);
