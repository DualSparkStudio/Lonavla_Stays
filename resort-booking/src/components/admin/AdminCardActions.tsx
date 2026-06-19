import React from 'react';
import { cn } from '../../utils/cn';

const base =
  'inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-bold transition-all shadow-sm';

export const adminActionBtn = {
  view: cn(base, 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md'),
  edit: cn(base, 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'),
  delete: cn(
    base,
    'bg-white text-red-600 border-2 border-red-400 hover:bg-red-50 hover:border-red-500 hover:shadow-md',
  ),
} as const;

type AdminCardActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

const AdminCardActions: React.FC<AdminCardActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  className,
}) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)}>
    {onView ? (
      <button type="button" onClick={onView} className={adminActionBtn.view}>
        View
      </button>
    ) : null}
    {onEdit ? (
      <button type="button" onClick={onEdit} className={adminActionBtn.edit}>
        Edit
      </button>
    ) : null}
    {onDelete ? (
      <button type="button" onClick={onDelete} className={adminActionBtn.delete}>
        Delete
      </button>
    ) : null}
  </div>
);

export default AdminCardActions;
