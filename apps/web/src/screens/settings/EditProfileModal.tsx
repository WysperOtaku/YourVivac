import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Avatar, Field, Icon, Modal } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { useAuthStore } from '@/stores/authStore';

export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setDisplayName(user.displayName);
      setUsername(user.username);
      setBio(user.bio ?? '');
    }
  }, [open, user]);

  const saveMut = useMutation({
    mutationFn: () => api.users.updateMe({ displayName: displayName.trim(), username: username.trim(), bio: bio.trim() }),
    onSuccess: (u) => {
      setUser(u);
      toast.success('Perfil actualizado');
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo guardar')),
  });

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setUser(await api.users.avatar(file));
      toast.success('Foto actualizada');
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo subir la foto'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar perfil">
      <form
        className="stack gap14"
        onSubmit={(e) => {
          e.preventDefault();
          saveMut.mutate();
        }}
      >
        <div className="row gap14">
          <div className="relative">
            <Avatar name={displayName || 'Tú'} size={64} ring src={user?.avatar?.url} className="overflow-hidden" style={{ fontSize: 24 }} />
            <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-accent text-accent-ink shadow">
              <Icon name={uploading ? 'clock' : 'camera'} size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={onAvatar} disabled={uploading} />
            </label>
          </div>
          <p className="muted text-[13px]">Toca el icono para cambiar tu foto de perfil.</p>
        </div>

        <Field label="Nombre" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Marcos Vidal" />
        <Field label="Usuario" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="marcosvidal" />
        <label className="stack gap6">
          <span className="eyebrow">Bio</span>
          <textarea
            className="min-h-[80px] w-full rounded-control bg-bg-3 px-3.5 py-2.5 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Coleccionando tresmiles del Pirineo…"
            maxLength={500}
          />
        </label>

        <button className="btn btn--block btn--lg" type="submit" disabled={saveMut.isPending}>
          {saveMut.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  );
}
