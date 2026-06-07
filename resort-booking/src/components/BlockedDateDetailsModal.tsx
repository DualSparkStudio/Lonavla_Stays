import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import type { BlockedDate } from '../types/site';

type BlockedDateDetailsModalProps = {
  blocked: BlockedDate | null;
  roomName?: string;
  onClose: () => void;
  onUnblock?: (id: string) => void;
};

const BlockedDateDetailsModal: React.FC<BlockedDateDetailsModalProps> = ({
  blocked,
  roomName,
  onClose,
  onUnblock,
}) => {
  if (!blocked) return null;

  return (
    <Modal isOpen onClose={onClose} title="Blocked dates" size="md">
      <dl className="space-y-3 text-base mb-6">
        <div>
          <dt className="font-bold text-gray-900">Villa</dt>
          <dd className="text-gray-700">{roomName ?? blocked.roomId}</dd>
        </div>
        <div>
          <dt className="font-bold text-gray-900">Range</dt>
          <dd className="text-gray-700">
            {blocked.startDate} – {blocked.endDate}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-gray-900">Reason</dt>
          <dd className="text-gray-700">{blocked.reason}</dd>
        </div>
        {blocked.notes && (
          <div>
            <dt className="font-bold text-gray-900">Notes</dt>
            <dd className="text-gray-700">{blocked.notes}</dd>
          </div>
        )}
      </dl>
      {onUnblock && (
        <Button variant="outline" fullWidth onClick={() => onUnblock(blocked.id)}>
          Unblock these dates
        </Button>
      )}
    </Modal>
  );
};

export default BlockedDateDetailsModal;
