import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { toast } from 'sonner';
import { Icon } from '@/ui';
import { Modal } from '@/ui/Modal';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';

export function TipReadModal({ slug, open, onClose }: { slug: string | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: tip, isLoading } = useQuery({
    queryKey: ['tip', slug],
    queryFn: () => api.tips.get(slug!),
    enabled: open && Boolean(slug),
    retry: false,
  });

  const likeMut = useMutation({
    mutationFn: () => api.tips.like(tip!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tip', slug] }),
    onError: (e) => toast.error(errMsg(e, 'No se pudo dar me gusta')),
  });
  const commentMut = useMutation({
    mutationFn: () => api.tips.comment(tip!.id, comment.trim()),
    onSuccess: () => {
      setComment('');
      qc.invalidateQueries({ queryKey: ['tip', slug] });
      toast.success('Comentario publicado');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo comentar')),
  });

  return (
    <Modal open={open} onClose={onClose} title={tip?.title ?? 'Consejo'} className="max-w-2xl">
      {isLoading || !tip ? (
        <div className="faint py-8 text-center text-sm">{isLoading ? 'Cargando…' : 'No encontrado'}</div>
      ) : (
        <div className="stack gap16">
          {tip.cover?.url && <div className="h-[180px] rounded-card bg-cover bg-center" style={{ backgroundImage: `url(${tip.cover.url})` }} />}
          <div className="row gap8">
            <span className="chip chip--terra">{tip.category}</span>
            <span className="faint mono text-[11px]">{tip.readMinutes}′ de lectura</span>
          </div>
          <article className="note-md text-[15px]">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {tip.contentMarkdown}
            </Markdown>
          </article>
          <div className="row gap16 border-t border-[var(--line)] pt-3">
            <button className="row gap6 text-sm" onClick={() => likeMut.mutate()} disabled={likeMut.isPending}>
              <Icon name="heart" size={18} /> {tip.counts?.likes ?? 0}
            </button>
            <span className="row gap6 faint text-sm">
              <Icon name="chat" size={18} /> {tip.counts?.comments ?? 0}
            </span>
          </div>
          <form
            className="row gap8"
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim()) commentMut.mutate();
            }}
          >
            <input
              className="grow rounded-control bg-bg-3 px-3.5 py-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
              placeholder="Escribe un comentario…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn px-4" type="submit" disabled={!comment.trim() || commentMut.isPending}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
