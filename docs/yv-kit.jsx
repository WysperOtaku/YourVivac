/* ============================================================
   YourVivac — Kit compartido (primitivos React)
   Exporta a window: Icon, Logo, Phone, StatusBar, TabBar, Avatar,
   Mark, GoogleG, Topo
   ============================================================ */

/* ---- Iconos lineales (trazo, minimalistas) ---- */
const ICONS = {
  home:    "M3 11.2 12 4l9 7.2M5.5 9.6V20h13V9.6",
  compass: "M12 12 16 8l-2.4 6.4L8 16l4-4Z|circle:12,12,9",
  plus:    "M12 5v14M5 12h14",
  chat:    "M4 5h16v11H9l-4 3.5V16H4z",
  user:    "M12 12a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM5 20c0-3.4 3-5.4 7-5.4s7 2 7 5.4",
  bell:    "M6.5 17V11a5.5 5.5 0 0 1 11 0v6l1.5 2H5zM10 19.5a2 2 0 0 0 4 0",
  search:  "M11 11m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M20 20l-4.5-4.5",
  link:    "M9.5 14.5 14.5 9.5M8 11 6.4 12.6a3.4 3.4 0 0 0 4.8 4.8L12.8 16M12 8l1.6-1.6a3.4 3.4 0 0 1 4.8 4.8L16.6 13",
  image:   "M4 5h16v14H4zM4 16l4.5-4.5 4 4L16 12l4 4M9 9.5a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z",
  note:    "M6 3.5h9L19 7v13.5H6zM14 3.8V7.5h3.6M9 12h7M9 15.5h7M9 8.5h3",
  list:    "M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01",
  pin:     "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  calendar:"M5 6h14v14H5zM5 10h14M9 4v3M15 4v3",
  mountain:"M3 19 10 7l4 6 2-3 5 9zM10 7l-1.5 2.5",
  arrow:   "M5 12h14M13 6l6 6-6 6",
  chevron: "M9 6l6 6-6 6",
  chevdown:"M6 9l6 6 6-6",
  heart:   "M12 20S4 14.5 4 9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 8 2.2C20 14.5 12 20 12 20Z",
  more:    "M5 12h.01M12 12h.01M19 12h.01",
  x:       "M6 6l12 12M18 6 6 18",
  check:   "M5 12.5 10 17 19 7",
  lock:    "M6.5 11V8a5.5 5.5 0 0 1 11 0v3M5 11h14v9H5z",
  clock:   "M12 12V7.5M12 12l3.2 1.8|circle:12,12,8.5",
  route:   "M7 19a2.2 2.2 0 1 0 0-4.4M17 9a2.2 2.2 0 1 0 0-4.4M7 14.6V12a4 4 0 0 1 4-4h2a4 4 0 0 0 4-4",
  ruler:   "M4 14 14 4l6 6L10 20zM8 8l2 2M11 5l2 2M5 11l2 2",
  elev:    "M3 18h18M6 18l4-7 3 4 2-3 3 6",
  users:   "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-2.8 2.6-4.4 6-4.4M16 11.4a2.6 2.6 0 1 0 0-5.2M15 14.8c3 .2 5 1.8 5 4.2",
  share:   "M7 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM9.2 11.7l5.6-3.2M9.2 12.3l5.6 3.2",
  settings:"M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H8.9l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 4 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.2l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  shield:  "M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z",
  star:    "M12 4l2.3 4.9 5.2.6-3.9 3.6 1 5.3L12 16.4 7.4 18.4l1-5.3L4.5 9.5l5.2-.6z",
  send:    "M5 12 20 5l-5 15-3-6z|M12 14l8-9",
  filter:  "M4 6h16M7 12h10M10 18h4",
  globe:   "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.5 9h17M3.5 15h17M12 3c2.5 2.4 3.6 5.5 3.6 9S14.5 18.6 12 21c-2.5-2.4-3.6-5.5-3.6-9S9.5 5.4 12 3Z",
  camera:  "M4 8h3l1.5-2h7L17 8h3v11H4zM12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  trophy:  "M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 0-3 3M9 18h6M10 14.5V18M14 14.5V18M8 21h8",
  flag:    "M6 21V4M6 5h11l-2 3 2 3H6",
  upload:  "M12 16V5M8 9l4-4 4 4M5 19h14",
  edit:    "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  download:"M12 4v11M8 11l4 4 4-4M5 20h14",
  grid:    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  trash:   "M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13",
  back:    "M15 6l-6 6 6 6",
  layers:  "M12 4 3 9l9 5 9-5zM3 14l9 5 9-5",
  thumb:   "M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2v3h5.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17 20H7",
};

function Icon({ name, size, cls = "", style }) {
  const raw = ICONS[name] || "";
  const parts = raw.split("|");
  return (
    <svg className={`ic ${cls}`} viewBox="0 0 24 24"
      style={{ width: size, height: size, ...style }} aria-hidden="true">
      {parts.map((p, i) => {
        if (p.startsWith("circle:")) {
          const [cx, cy, r] = p.slice(7).split(",");
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        return <path key={i} d={p} />;
      })}
    </svg>
  );
}

/* ---- G de Google (multicolor, marca) ---- */
function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.4 44 31 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

/* ---- Marca: pico + anillos de nivel ---- */
function Mark({ size = 30, color }) {
  const c = color || "var(--accent)";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ display: "block" }}>
      <circle cx="20" cy="20" r="18.5" fill="none" stroke={c} strokeWidth="1.4" opacity="0.45" />
      <circle cx="20" cy="20" r="13" fill="none" stroke={c} strokeWidth="1.4" opacity="0.75" />
      <path d="M9 27 L18 12 L23 20 L26.5 15 L31 27 Z" fill={c} />
    </svg>
  );
}

/* ---- Logotipo (marca + wordmark) ---- */
function Logo({ size = 22, color, mark = true, tone }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.42 }}>
      {mark && <Mark size={size * 1.35} color={tone} />}
      <span style={{
        fontFamily: "var(--font-display)", fontSize: size, lineHeight: 1,
        letterSpacing: "-0.01em", color: color || "var(--ink)",
      }}>
        Your<span style={{ color: tone || "var(--accent)" }}>Vivac</span>
      </span>
    </span>
  );
}

/* ---- Avatar ---- */
function Avatar({ name = "", size = 38, tone = "", ring = false, img = false, style }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`av ${tone} ${ring ? "ring" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.38, ...style }}>
      {initials || "·"}
    </div>
  );
}

/* ---- Barra de estado del teléfono ---- */
function StatusBar({ time = "8:42" }) {
  return (
    <div className="phone__status">
      <span className="tnum">{time}</span>
      <span className="dots">
        <span className="bar" style={{ height: 6 }} />
        <span className="bar" style={{ height: 9 }} />
        <span className="bar" style={{ height: 12 }} />
        <span className="bar" style={{ height: 14, opacity: .4 }} />
        <svg width="22" height="13" viewBox="0 0 24 14" style={{ marginLeft: 4 }} fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1" y="2.5" width="18" height="9" rx="2.6" /><rect x="3" y="4.5" width="12" height="5" rx="1" fill="currentColor" stroke="none" /><path d="M21.5 5.5v3" />
        </svg>
      </span>
    </div>
  );
}

/* ---- Carcasa teléfono ---- */
function Phone({ children, time, dark, theme, type, density, style }) {
  return (
    <div className="yv phone"
      data-theme={theme} data-type={type} data-density={density}
      style={style}>
      <StatusBar time={time} />
      <div className="phone__body">{children}</div>
    </div>
  );
}

/* ---- Barra de pestañas ---- */
function TabBar({ active = "home" }) {
  const tabs = [
    { id: "home", icon: "home", label: "Inicio" },
    { id: "explore", icon: "compass", label: "Explorar" },
    { id: "new", icon: "plus", label: "" },
    { id: "trips", icon: "layers", label: "Salidas" },
    { id: "me", icon: "user", label: "Perfil" },
  ];
  return (
    <nav className="tabbar">
      {tabs.map(t => t.id === "new" ? (
        <div key="new" className="tab" style={{ flex: "none" }}>
          <div style={{ width: 46, height: 46, borderRadius: 16, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-sm)", marginTop: -8 }}>
            <Icon name="plus" cls="lg" />
          </div>
        </div>
      ) : (
        <div key={t.id} className={`tab ${active === t.id ? "is-active" : ""}`}>
          <Icon name={t.icon} cls="sm" />
          <span className="t">{t.label}</span>
        </div>
      ))}
    </nav>
  );
}

/* ---- Cabecera de pantalla (móvil) ---- */
function AppBar({ title, left = "back", right, sub }) {
  return (
    <header className="row" style={{ padding: "8px 18px 10px", gap: 12, flex: "none" }}>
      {left === "back" && <Icon name="back" cls="lg" />}
      {left === "logo" && <Logo size={18} />}
      {left && left !== "back" && left !== "logo" && left}
      <div className="grow" style={{ minWidth: 0 }}>
        {title && <h3 style={{ fontSize: 19 }}>{title}</h3>}
        {sub && <div className="eyebrow" style={{ marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </header>
  );
}

Object.assign(window, { Icon, GoogleG, Mark, Logo, Avatar, StatusBar, Phone, TabBar, AppBar });
