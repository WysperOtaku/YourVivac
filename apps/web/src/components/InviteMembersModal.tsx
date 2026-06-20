import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UserSearchResult } from '@yourvivac/types';
import { Modal } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { PeoplePicker } from './PeoplePicker';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
  /** Ids de quienes ya son miembros (se muestran como «ya en la salida»). */
  existingIds?: string[];
}

export function InviteMembersModal({ open, onClose, tripId, existingIds = [] }: Props) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const inviteMut = useMutation({
    mutationFn: () => api.trips.invite(tripId, { users: selected.map((u) => u.id) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trip', tripId] });
      qc.invalidateQueries({ queryKey: ['trips'] });
      toast.success(selected.length === 1 ? 'Invitación enviada' : 'Invitaciones enviadas');
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo invitar')),
  });

  return (
    <Modal open={open} onClose={onClose} title="Invitar montañeros">
      <PeoplePicker selected={selected} onChange={setSelected} excludeIds={existingIds} autoFocus />
      <button
        className="btn btn--block btn--lg mt-4"
        disabled={selected.length === 0 || inviteMut.isPending}
        onClick={() => inviteMut.mutate()}
      >
        {inviteMut.isPending
          ? 'Invitando…'
          : selected.length > 0
            ? `Invitar a ${selected.length}`
            : 'Selecciona a quién invitar'}
      </button>
    </Modal>
  );
}
