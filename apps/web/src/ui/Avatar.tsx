import { cn } from '@/lib/cn';

type Tone = '' | 't' | 's';

interface Props {
  name: string;
  src?: string;
  size?: number;
  /** '' = accent (verde), 't' = terra, 's' = sky (mismo criterio que el diseño). */
  tone?: Tone;
  ring?: boolean;
  /** Marca el avatar como «tú»: anillo de color distinto para diferenciarte del grupo. */
  me?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, src, size = 38, tone = '', ring, me, className, style }: Props) {
  return (
    <div
      className={cn('av', tone, ring && 'ring', me && 'me', className)}
      style={{ width: size, height: size, fontSize: size * 0.38, ...style }}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials(name) || '·'}
    </div>
  );
}
