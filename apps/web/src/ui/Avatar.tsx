import { cn } from '@/lib/cn';

type Tone = 'accent' | 'terra' | 'sky';

interface Props {
  name: string;
  src?: string;
  size?: number;
  tone?: Tone;
  ring?: boolean;
  className?: string;
}

const toneBg: Record<Tone, string> = {
  accent: 'bg-accent',
  terra: 'bg-terra',
  sky: 'bg-sky',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, src, size = 40, tone = 'accent', ring, className }: Props) {
  return (
    <div
      className={cn(
        'grid place-items-center rounded-full font-mono font-medium text-accent-ink overflow-hidden flex-none',
        toneBg[tone],
        ring && 'ring-2 ring-bg',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}
