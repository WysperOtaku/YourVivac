import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Field, Modal, Toggle } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { useAuthStore } from '@/stores/authStore';

export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  useEffect(() => {
    if (open && user) setEmail(user.email);
  }, [open, user]);

  const isPublic = user?.settings?.profileVisibility !== 'private';

  const emailMut = useMutation({
    mutationFn: () => api.users.updateMe({ email: email.trim() }),
    onSuccess: (u) => {
      setUser(u);
      toast.success('Email actualizado · verifícalo de nuevo');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo cambiar el email')),
  });
  const passwordMut = useMutation({
    mutationFn: () => api.auth.changePassword({ currentPassword: current || undefined, newPassword: next }),
    onSuccess: () => {
      setCurrent('');
      setNext('');
      toast.success('Contraseña actualizada');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo cambiar la contraseña')),
  });
  const visMut = useMutation({
    mutationFn: (v: boolean) => api.users.updateSettings({ profileVisibility: v ? 'public' : 'private' }),
    onSuccess: (u) => setUser(u),
    onError: (e) => toast.error(errMsg(e, 'No se pudo guardar')),
  });

  return (
    <Modal open={open} onClose={onClose} title="Privacidad y seguridad">
      <div className="stack gap16">
        {/* Visibilidad del perfil */}
        <div className="card row gap12 p-3.5">
          <div className="grow">
            <div className="text-[15px]">Perfil público</div>
            <div className="faint mono mt-0.5 text-[11px]">Si lo desactivas, solo tú ves tu perfil.</div>
          </div>
          <Toggle checked={isPublic} onChange={(v) => visMut.mutate(v)} label="visibilidad" />
        </div>

        {/* Email */}
        <form
          className="stack gap8"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim() && email.trim() !== user?.email) emailMut.mutate();
          }}
        >
          <span className="eyebrow">Correo electrónico</span>
          <div className="row gap8">
            <div className="grow">
              <Field type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
            </div>
            <button className="btn px-4" type="submit" disabled={emailMut.isPending || email.trim() === user?.email}>
              Cambiar
            </button>
          </div>
        </form>

        {/* Contraseña */}
        <form
          className="stack gap8"
          onSubmit={(e) => {
            e.preventDefault();
            if (next.length >= 8) passwordMut.mutate();
          }}
        >
          <span className="eyebrow">Cambiar contraseña</span>
          <Field type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Contraseña actual" />
          <Field type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nueva contraseña (mín. 8)" />
          <button className="btn btn--block" type="submit" disabled={passwordMut.isPending || next.length < 8}>
            {passwordMut.isPending ? 'Guardando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
