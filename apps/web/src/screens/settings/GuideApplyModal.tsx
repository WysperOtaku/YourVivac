import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MediaRef } from '@yourvivac/types';
import { Field, Icon, Modal } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { uploadImage } from '@/lib/upload';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente de revisión',
  in_review: 'En revisión',
  approved: 'Aprobada ✅',
  rejected: 'Rechazada',
};

export function GuideApplyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [certification, setCertification] = useState('');
  const [certBody, setCertBody] = useState('');
  const [documents, setDocuments] = useState<MediaRef[]>([]);
  const [uploading, setUploading] = useState(false);

  // Estado de una solicitud existente.
  const appQ = useQuery({
    queryKey: ['guide-application'],
    queryFn: () => api.guide.application(),
    enabled: open,
    retry: false,
  });

  const applyMut = useMutation({
    mutationFn: () => api.guide.apply({ certification, certBody, documents }),
    onSuccess: () => {
      toast.success('Solicitud enviada');
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo enviar la solicitud')),
  });

  async function onPickDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ref = await uploadImage(file);
      setDocuments((d) => [...d, ref]);
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo subir el documento'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const existing = appQ.data;

  return (
    <Modal open={open} onClose={onClose} title="Solicitar rol de guía">
      {existing && existing.status !== 'rejected' ? (
        <div className="stack gap10">
          <p className="muted text-sm">Ya tienes una solicitud.</p>
          <div className="card p-3.5">
            <div className="eyebrow">Estado</div>
            <div className="mt-1 text-[15px]">{STATUS_LABEL[existing.status] ?? existing.status}</div>
            {existing.notes && <p className="faint mono mt-2 text-[12px]">{existing.notes}</p>}
          </div>
          <button className="btn btn--block" onClick={onClose}>Cerrar</button>
        </div>
      ) : (
        <form
          className="stack gap12"
          onSubmit={(e) => {
            e.preventDefault();
            if (documents.length === 0) {
              toast.error('Añade al menos un documento que acredite tu titulación');
              return;
            }
            applyMut.mutate();
          }}
        >
          <p className="muted text-sm">
            Verifica tu titulación para ayudar a otros como guía certificado.
          </p>
          <Field label="Titulación" placeholder="Técnico Deportivo en Media Montaña" value={certification} onChange={(e) => setCertification(e.target.value)} />
          <Field label="Organismo certificador" placeholder="TECNOS / Federación…" value={certBody} onChange={(e) => setCertBody(e.target.value)} />

          <div className="stack gap6">
            <span className="eyebrow">Documentos ({documents.length})</span>
            <div className="row gap8 flex-wrap">
              {documents.map((d, i) => (
                <div key={i} className="h-16 w-16 rounded-pin bg-cover bg-center shadow-[inset_0_0_0_1px_var(--line)]" style={{ backgroundImage: `url(${d.url})` }} />
              ))}
              <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-pin text-ink-3 shadow-[inset_0_0_0_1.5px_var(--line-2)]">
                <Icon name={uploading ? 'clock' : 'plus'} size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={onPickDoc} disabled={uploading} />
              </label>
            </div>
          </div>

          <button className="btn btn--block btn--lg" type="submit" disabled={applyMut.isPending || uploading}>
            {applyMut.isPending ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      )}
    </Modal>
  );
}
