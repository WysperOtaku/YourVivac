interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/** Marca YourVivac: pico + anillos de nivel topográfico + wordmark. */
export function Logo({ size = 22, withWordmark = true, className }: Props) {
  const mark = size * 1.35;
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.42 }}>
      <svg width={mark} height={mark} viewBox="0 0 40 40" aria-hidden style={{ display: 'block' }}>
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity="0.45" />
        <circle cx="20" cy="20" r="13" fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity="0.75" />
        <path d="M9 27 L18 12 L23 20 L26.5 15 L31 27 Z" fill="var(--accent)" />
      </svg>
      {withWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          Your<span style={{ color: 'var(--accent)' }}>Vivac</span>
        </span>
      )}
    </span>
  );
}
