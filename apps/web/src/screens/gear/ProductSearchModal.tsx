import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AggregatedProduct, GearItemInput, ProductOffer, StoreKey } from '@yourvivac/types';
import { Icon } from '@/ui';
import { Modal } from '@/ui/Modal';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';

const STORE_LABEL: Record<StoreKey, string> = {
  amazon: 'Amazon',
  decathlon: 'Decathlon',
  deporvillage: 'Deporvillage',
  barrabes: 'Barrabés',
  forum: 'Forum',
  coleman: 'Coleman',
};

export function ProductSearchModal({ open, onClose, listId }: { open: boolean; onClose: () => void; listId: string | null }) {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');

  const searchQ = useQuery({
    queryKey: ['products', submitted],
    queryFn: () => api.products.search(submitted),
    enabled: open && submitted.length > 1,
    retry: false,
  });

  const addMut = useMutation({
    mutationFn: (item: GearItemInput) => api.gear.addItem(listId!, item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gear'] });
      toast.success('Añadido a la lista');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo añadir')),
  });

  function add(product: AggregatedProduct, offer: ProductOffer) {
    addMut.mutate({
      name: product.product,
      product: {
        storeKey: offer.store,
        title: product.product,
        url: offer.url,
        price: offer.price,
        currency: offer.currency,
        image: product.image,
        externalId: product.externalId,
      },
    });
  }

  const results = searchQ.data?.results ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Buscar material en tiendas" className="max-w-2xl">
      <form
        className="row gap8 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q.trim());
        }}
      >
        <input
          className="grow rounded-control bg-bg-3 px-3.5 py-2.5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
          placeholder="saco de dormir, crampones…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn px-4" type="submit"><Icon name="search" size={18} /></button>
      </form>

      {searchQ.isLoading ? (
        <div className="faint py-8 text-center text-sm">Buscando en las tiendas…</div>
      ) : searchQ.isError ? (
        <div className="faint py-8 text-center text-sm">El buscador de tiendas no está disponible ahora mismo.</div>
      ) : submitted && results.length === 0 ? (
        <div className="faint py-8 text-center text-sm">Sin resultados para “{submitted}”.</div>
      ) : (
        <div className="stack gap10 max-h-[50vh] overflow-y-auto">
          {results.map((p, i) => (
            <div key={`${p.externalId ?? p.product}-${i}`} className="card row gap12 p-3">
              <div className="imgslot topo none h-12 w-12 flex-none rounded-pin bg-cover bg-center" style={p.image ? { backgroundImage: `url(${p.image})` } : undefined} />
              <div className="grow min-w-0">
                <div className="text-[14px] leading-tight">{p.product}</div>
                <div className="row gap6 flex-wrap mt-1.5">
                  {p.offers.map((o, j) => (
                    <button
                      key={j}
                      onClick={() => add(p, o)}
                      disabled={addMut.isPending || !listId}
                      className={`store store--${o.store}`}
                      style={{ cursor: 'pointer' }}
                      title={`Añadir desde ${STORE_LABEL[o.store]}`}
                    >
                      {STORE_LABEL[o.store]} · {o.price}{o.currency === 'EUR' ? '€' : ` ${o.currency}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
