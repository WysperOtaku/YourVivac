import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { LatLng } from '@/lib/maps';

export interface PickedPlace {
  name: string;
  coords: LatLng;
  placeId?: string;
  address?: string;
}

interface Props {
  onPick: (place: PickedPlace) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

/** Input con autocompletado de lugares de Google Places. */
export function LocationSearch({ onPick, placeholder, defaultValue, className }: Props) {
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const ac = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address', 'place_id'],
    });
    const listener = ac.addListener('place_changed', () => {
      const p = ac.getPlace();
      const loc = p.geometry?.location;
      if (!loc) return;
      onPickRef.current({
        name: p.name ?? p.formatted_address ?? '',
        coords: { lat: loc.lat(), lng: loc.lng() },
        placeId: p.place_id,
        address: p.formatted_address,
      });
    });
    return () => listener.remove();
  }, [places]);

  return (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder={placeholder ?? 'Busca un lugar…'}
      className={
        className ??
        'w-full rounded-control bg-bg-3 px-3.5 py-2.5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]'
      }
    />
  );
}
