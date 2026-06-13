/* ============================================================
   YourVivac — Vistas adicionales
   ExploreScreen · TeamScreen · TipsScreen
   PublishTipModal · SettingsScreen · AdminPanel
   ============================================================ */

/* ---- Tarjeta de consejo (reutilizable) ---- */
function TipCard({ title, who, tone, guide, cat, mins, likes, big }) {
  return (
    <article className="card" style={{ overflow: "hidden", marginBottom: 12 }}>
      <div className="imgslot topo" style={{ height: big ? 150 : 104, alignItems: "flex-start" }}>
        <span className="chip chip--terra" style={{ margin: 10 }}>{cat}</span>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <h3 style={{ fontSize: big ? 21 : 17, lineHeight: 1.08 }}>{title}</h3>
        <div className="row gap8" style={{ marginTop: 10 }}>
          <Avatar name={who} tone={tone} size={26} />
          <div className="grow row gap6" style={{ minWidth: 0 }}>
            <span style={{ fontSize: 13 }}>{who}</span>
            {guide && <span className="chip chip--guide" style={{ fontSize: 8.5, padding: "1px 6px" }}><Icon name="shield" style={{ width: 10, height: 10 }} /> Guía</span>}
          </div>
          <span className="faint mono row gap4" style={{ fontSize: 11 }}><Icon name="clock" style={{ width: 12, height: 12 }} /> {mins}'</span>
          <span className="faint mono row gap4" style={{ fontSize: 11 }}><Icon name="heart" style={{ width: 12, height: 12 }} /> {likes}</span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- EXPLORAR ---------------- */
function ExploreScreen() {
  const trips = [
    { n: "Vivac en Monte Perdido", who: "Bea L.", t: "t", m: "1.610", k: "92" },
    { n: "Travesía Carros de Foc", who: "Diego R.", t: "s", m: "3.200", k: "146" },
    { n: "Luna llena en Gredos", who: "Sara V.", t: "", m: "880", k: "57" },
    { n: "Cresta de los Infiernos", who: "Iker M.", t: "s", m: "1.340", k: "73" },
  ];
  return (
    <div className="screen">
      <header style={{ padding: "6px 18px 12px", flex: "none" }}>
        <div className="spread">
          <h1 style={{ fontSize: 25 }}>Explorar</h1>
          <Icon name="filter" />
        </div>
        <div className="row gap10" style={{ background: "var(--bg-2)", borderRadius: 12, padding: "11px 14px", boxShadow: "inset 0 0 0 1px var(--line)", marginTop: 12 }}>
          <Icon name="search" cls="sm" style={{ color: "var(--ink-3)" }} />
          <span className="faint" style={{ fontSize: 15 }}>Busca picos, rutas o personas…</span>
        </div>
        <div className="row gap6" style={{ marginTop: 12 }}>
          <span className="chip chip--accent grow" style={{ justifyContent: "center", padding: "7px 0" }}>Salidas públicas</span>
          <span className="chip grow" style={{ justifyContent: "center", padding: "7px 0" }}>Consejos</span>
          <span className="chip grow" style={{ justifyContent: "center", padding: "7px 0" }}>Gente</span>
        </div>
      </header>

      <div className="screen__scroll" style={{ padding: "4px 18px 18px" }}>
        {/* destacado */}
        <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
          <div className="imgslot topo" style={{ height: 170, alignItems: "flex-end", justifyContent: "space-between" }}>
            <span className="chip" style={{ margin: 12, background: "color-mix(in srgb,var(--bg) 62%,transparent)", backdropFilter: "blur(3px)" }}><Icon name="star" style={{ width: 12, height: 12, color: "var(--terra)" }} /> Destacado</span>
            <span className="chip mono" style={{ margin: 12, background: "color-mix(in srgb,var(--bg) 62%,transparent)", backdropFilter: "blur(3px)" }}>3.200 m+</span>
          </div>
          <div style={{ padding: "13px 15px 15px" }}>
            <h2 style={{ fontSize: 22 }}>Carros de Foc en 4 días</h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 5 }}>Travesía completa por los refugios de Aigüestortes. Ruta pública de Diego.</p>
            <div className="row gap8" style={{ marginTop: 12 }}>
              <Avatar name="Diego R" tone="s" size={28} />
              <span className="grow" style={{ fontSize: 13.5 }}>Diego Romero</span>
              <span className="chip"><Icon name="heart" style={{ width: 12, height: 12 }} /> 146</span>
              <span className="chip"><Icon name="download" style={{ width: 12, height: 12 }} /> GPX</span>
            </div>
          </div>
        </div>

        <div className="spread" style={{ margin: "4px 0 12px" }}>
          <h3 className="eyebrow">Salidas públicas cerca</h3>
          <span className="faint mono" style={{ fontSize: 12 }}>Pirineos</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {trips.map((tp, i) => (
            <div key={i} className="card" style={{ overflow: "hidden" }}>
              <div className="imgslot topo" style={{ height: 96, alignItems: "flex-start" }}>
                <span className="chip mono" style={{ margin: 8, fontSize: 9.5, padding: "2px 7px", background: "color-mix(in srgb,var(--bg) 60%,transparent)" }}>{tp.m} m+</span>
              </div>
              <div style={{ padding: "10px 11px 11px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.05 }}>{tp.n}</div>
                <div className="row gap6" style={{ marginTop: 8 }}>
                  <Avatar name={tp.who} tone={tp.t} size={20} style={{ fontSize: 9 }} />
                  <span className="faint" style={{ fontSize: 12 }}>{tp.who}</span>
                  <span className="grow" />
                  <span className="faint mono row gap4" style={{ fontSize: 10.5 }}><Icon name="heart" style={{ width: 11, height: 11 }} /> {tp.k}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="explore" />
    </div>
  );
}

/* ---------------- MI EQUIPO ---------------- */
function TeamScreen() {
  const lists = [
    { n: "Vivac de verano", items: "12 ítems", kg: "6,4", icon: "mountain", tone: "var(--accent)", used: "3 salidas" },
    { n: "Alpinismo invernal", items: "18 ítems", kg: "9,1", icon: "layers", tone: "var(--sky)", used: "2 salidas" },
    { n: "Travesía ligera", items: "9 ítems", kg: "4,2", icon: "route", tone: "var(--terra)", used: "5 salidas" },
  ];
  const owned = [
    { t: "Saco Trangoworld -5 ºC", store: "amazon", label: "Amazon", w: "1.180 g" },
    { t: "Esterilla Forclaz MT500", store: "decath", label: "Decathlon", w: "480 g" },
    { t: "Crampones Camp Stalker", store: "barrabes", label: "Barrabés", w: "920 g" },
  ];
  return (
    <div className="screen">
      <AppBar left="logo" title="" right={<Icon name="search" />} />
      <div style={{ padding: "0 18px 6px", flex: "none" }}>
        <h1 style={{ fontSize: 26 }}>Mi equipo</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>Tus listas reutilizables y tu material guardado.</p>
      </div>
      <div className="screen__scroll" style={{ padding: "10px 18px 16px" }}>
        <div className="spread" style={{ marginBottom: 10 }}>
          <span className="eyebrow">Mis listas</span>
          <span className="accent row gap4 mono" style={{ fontSize: 12.5 }}><Icon name="plus" style={{ width: 13, height: 13 }} /> Nueva lista</span>
        </div>
        <div className="stack gap10">
          {lists.map((l, i) => (
            <div key={i} className="card row gap12" style={{ padding: 13 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, display: "grid", placeItems: "center", color: l.tone, boxShadow: `inset 0 0 0 1px color-mix(in srgb,${l.tone} 38%,transparent)` }}><Icon name={l.icon} /></div>
              <div className="grow" style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{l.n}</div>
                <div className="faint mono" style={{ fontSize: 11, marginTop: 3 }}>{l.items} · {l.kg} kg · usada en {l.used}</div>
              </div>
              <Icon name="chevron" cls="sm" style={{ color: "var(--ink-3)" }} />
            </div>
          ))}
        </div>

        <div className="spread" style={{ margin: "22px 0 10px" }}>
          <span className="eyebrow">Mi material guardado</span>
          <span className="faint mono" style={{ fontSize: 12 }}>24 ítems</span>
        </div>
        <div className="card" style={{ padding: "4px 14px" }}>
          {owned.map((o, i) => (
            <div key={i} className="row gap12" style={{ padding: "11px 0", borderBottom: i < owned.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div className="imgslot topo none" style={{ width: 42, height: 42, borderRadius: 10 }} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5 }}>{o.t}</div>
                <div className="row gap8" style={{ marginTop: 5 }}><span className={`store store--${o.store}`}>{o.label}</span><span className="faint mono" style={{ fontSize: 11 }}>{o.w}</span></div>
              </div>
              <Icon name="more" cls="sm" style={{ color: "var(--ink-3)" }} />
            </div>
          ))}
        </div>

        {/* buscador unificado */}
        <div className="card" style={{ marginTop: 16, padding: 15, background: "var(--bg-3)" }}>
          <div className="row gap8"><Icon name="search" cls="sm" style={{ color: "var(--accent)" }} /><strong style={{ fontSize: 14.5 }}>Buscar material en tiendas</strong></div>
          <p className="faint" style={{ fontSize: 12.5, marginTop: 6 }}>Un solo buscador para Amazon, Decathlon, Deporvillage, Barrabés, Forum Sport y Coleman.</p>
          <div className="row gap6 wrap" style={{ marginTop: 10 }}>
            {["amazon|Amazon", "decath|Decathlon", "deporv|Deporvillage", "barrabes|Barrabés", "forum|Forum", "coleman|Coleman"].map((s, i) => { const [k, l] = s.split("|"); return <span key={i} className={`store store--${k}`}>{l}</span>; })}
          </div>
        </div>
      </div>
      <TabBar active="me" />
    </div>
  );
}

/* ---------------- CONSEJOS ---------------- */
function TipsScreen() {
  const cats = ["Todos", "Material", "Seguridad", "Rutas", "Vivac responsable", "Meteo"];
  return (
    <div className="screen">
      <header style={{ padding: "6px 18px 10px", flex: "none" }}>
        <div className="spread">
          <h1 style={{ fontSize: 25 }}>Consejos</h1>
          <button className="btn" style={{ padding: "9px 15px", fontSize: 14 }}><Icon name="edit" cls="sm" /> Publicar</button>
        </div>
        <div className="row gap6 wrap" style={{ marginTop: 12 }}>
          {cats.map((c, i) => <span key={i} className={`chip ${i === 0 ? "chip--accent" : ""}`}>{c}</span>)}
        </div>
      </header>
      <div className="screen__scroll" style={{ padding: "6px 18px 18px" }}>
        <TipCard big title="Cómo elegir el saco según la cota del vivac" who="Lucía Roldán" tone="t" guide cat="Material" mins="6" likes="218" />
        <TipCard title="Vivac responsable: no dejar rastro (LNT)" who="Editorial YourVivac" tone="" cat="Vivac responsable" mins="4" likes="190" />
        <TipCard title="Leer un parte de AEMET de montaña" who="Diego Romero" tone="s" guide cat="Meteo" mins="5" likes="134" />
        <TipCard title="Qué llevar en el botiquín de travesía" who="Bea López" tone="t" cat="Seguridad" mins="7" likes="98" />
      </div>
      <TabBar active="explore" />
    </div>
  );
}

/* ---------------- MODAL PUBLICAR CONSEJO ---------------- */
function PublishTipModal() {
  return (
    <div className="screen" style={{ background: "transparent" }}>
      {/* fondo atenuado */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,10,7,.62)", backdropFilter: "blur(2px)" }} />
      {/* hoja inferior */}
      <div style={{ marginTop: "auto", position: "relative", zIndex: 2, background: "var(--bg-2)", borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: "var(--shadow)", maxHeight: "92%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 0 4px", display: "grid", placeItems: "center", flex: "none" }}><span style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line-2)" }} /></div>
        <div className="spread" style={{ padding: "8px 20px 12px", flex: "none" }}>
          <h2 style={{ fontSize: 22 }}>Publicar consejo</h2>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--bg-3)", display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 1px var(--line)" }}><Icon name="x" cls="sm" /></span>
        </div>
        <div style={{ padding: "0 20px 12px", overflow: "hidden" }}>
          {/* portada */}
          <div className="imgslot topo" style={{ height: 116, borderRadius: 14, marginBottom: 16, alignItems: "center", justifyContent: "center" }}>
            <div className="stack gap6" style={{ alignItems: "center", margin: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "color-mix(in srgb,var(--bg) 65%,transparent)", display: "grid", placeItems: "center", backdropFilter: "blur(3px)" }}><Icon name="image" /></div>
              <span className="mono faint" style={{ fontSize: 11 }}>Añade una portada</span>
            </div>
          </div>
          <Field label="Título"><Input value="Cómo elegir el saco según la cota" /></Field>
          <Field label="Categoría">
            <div className="row gap6 wrap">
              <span className="chip chip--accent">Material</span><span className="chip">Seguridad</span><span className="chip">Rutas</span><span className="chip">Meteo</span><span className="chip">Vivac responsable</span>
            </div>
          </Field>
          <div className="stack gap6" style={{ marginBottom: 8 }}>
            <span className="eyebrow">Contenido · Markdown</span>
            <div className="card note-md" style={{ padding: "13px 14px", fontSize: 14 }}>
              <p><strong>La temperatura de confort</strong> debe estar por debajo de la mínima prevista.</p>
              <ul style={{ marginBottom: 0 }}><li>Vivac de verano &gt; 2.000 m → <code>-5 ºC</code></li><li>Invernal → pluma y saco <code>-15 ºC</code></li></ul>
            </div>
            <div className="row gap6 wrap" style={{ marginTop: 4 }}>
              {[["#", "H1"], ["**", "B"], ["-", "Lista"], ["[]", "Link"], ["`", "Cód"]].map(([s, l], i) => <span key={i} className="chip mono" style={{ fontSize: 10.5 }}>{s} {l}</span>)}
            </div>
          </div>
        </div>
        <div className="row gap10" style={{ padding: "12px 20px", boxShadow: "inset 0 1px 0 var(--line)", flex: "none" }}>
          <button className="btn btn--ghost grow">Guardar borrador</button>
          <button className="btn grow" style={{ flex: 2 }}>Publicar consejo</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- AJUSTES ---------------- */
function SettingsScreen() {
  const Toggle = ({ on }) => (
    <span style={{ width: 42, height: 25, borderRadius: 13, background: on ? "var(--accent)" : "var(--bg-4)", boxShadow: on ? "none" : "inset 0 0 0 1px var(--line-2)", position: "relative", flex: "none" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 19, height: 19, borderRadius: 10, background: on ? "var(--accent-ink)" : "var(--ink-2)", transition: "left .15s" }} />
    </span>
  );
  const Group = ({ label, children }) => (
    <section style={{ marginBottom: 18 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div className="card" style={{ padding: "2px 14px" }}>{children}</div>
    </section>
  );
  const Row = ({ icon, t, sub, right, last, tone }) => (
    <div className="row gap12" style={{ padding: "13px 0", borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", color: tone || "var(--ink-2)", boxShadow: "inset 0 0 0 1px var(--line)" }}><Icon name={icon} cls="sm" /></div>
      <div className="grow" style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15 }}>{t}</div>
        {sub && <div className="faint mono" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>}
      </div>
      {right || <Icon name="chevron" cls="sm" style={{ color: "var(--ink-3)" }} />}
    </div>
  );
  return (
    <div className="screen">
      <AppBar title="Ajustes" />
      <div className="screen__scroll" style={{ padding: "4px 18px 18px" }}>
        {/* cuenta */}
        <div className="card row gap14" style={{ padding: 14, marginBottom: 18 }}>
          <Avatar name="Marcos Vidal" size={54} style={{ fontSize: 20 }} ring />
          <div className="grow"><div style={{ fontFamily: "var(--font-display)", fontSize: 19 }}>Marcos Vidal</div><div className="faint row gap6 mono" style={{ fontSize: 11.5, marginTop: 3 }}><GoogleG size={13} /> marcos.vidal@gmail.com</div></div>
          <span className="chip">Editar</span>
        </div>

        <Group label="Cuenta">
          <Row icon="user" t="Perfil público" sub="@marcosvidal" />
          <Row icon="shield" t="Solicitar rol de guía" sub="Verifica tu titulación" tone="var(--terra)" right={<span className="chip chip--terra">Nuevo</span>} />
          <Row icon="lock" t="Privacidad y seguridad" last />
        </Group>

        <Group label="Preferencias">
          <Row icon="bell" t="Notificaciones push" right={<Toggle on />} />
          <Row icon="globe" t="Salidas públicas por defecto" sub="Tus salidas se ven en Explorar" right={<Toggle />} />
          <Row icon="image" t="Tema" sub="Sistema · claro / oscuro" />
          <Row icon="ruler" t="Unidades" sub="Métrico · metros, km, kg" last />
        </Group>

        <Group label="Soporte">
          <Row icon="chat" t="Centro de ayuda" />
          <Row icon="note" t="Términos y privacidad" last />
        </Group>

        <button className="btn btn--ghost btn--block" style={{ color: "var(--terra)", boxShadow: "inset 0 0 0 1px color-mix(in srgb,var(--terra) 40%,transparent)" }}>Cerrar sesión</button>
        <p className="faint mono" style={{ textAlign: "center", fontSize: 11, marginTop: 14 }}>YourVivac · v1.0.0</p>
      </div>
    </div>
  );
}

/* ---------------- PANEL DE ADMINISTRACIÓN (escritorio) ---------------- */
function AdminPanel({ theme, type, density }) {
  const nav = [["grid", "Resumen", true], ["users", "Usuarios"], ["shield", "Verificar guías", false, "4"], ["note", "Consejos"], ["flag", "Reportes", false, "2"], ["layers", "Salidas"], ["settings", "Ajustes"]];
  const kpis = [["Usuarios", "12.480", "+312 esta semana", "var(--accent)"], ["Salidas creadas", "3.927", "+148", "var(--ink)"], ["Consejos publicados", "612", "+24", "var(--sky)"], ["Guías verificados", "38", "+3", "var(--terra)"]];
  const queue = [
    { n: "Lucía Roldán", mail: "lucia.r@gmail.com", cert: "TD Media Montaña · FEDME", date: "hoy", st: "Pendiente" },
    { n: "Diego Romero", mail: "diego@guiaspirineos.es", cert: "Guía AEGM", date: "ayer", st: "Pendiente" },
    { n: "Bea López", mail: "bea.lopez@gmail.com", cert: "TD Escalada", date: "2 jun", st: "En revisión" },
  ];
  const reports = [["Comentario ofensivo", "Salida #2841", "Pendiente"], ["Enlace roto a tienda", "Consejo #517", "Resuelto"]];
  return (
    <div className="yv" data-theme={theme} data-type={type} data-density={density} style={{ width: "100%", height: "100%", display: "flex", background: "var(--bg)", overflow: "hidden" }}>
      {/* rail */}
      <aside style={{ width: 232, flex: "none", background: "var(--bg-2)", boxShadow: "inset -1px 0 0 var(--line)", padding: "24px 16px", display: "flex", flexDirection: "column" }}>
        <div className="row gap8" style={{ padding: "0 8px 6px" }}><Logo size={19} /></div>
        <div className="chip chip--terra" style={{ margin: "10px 8px 20px", alignSelf: "flex-start" }}><Icon name="lock" style={{ width: 12, height: 12 }} /> Admin</div>
        <nav className="stack gap2">
          {nav.map(([ic, l, on, badge], i) => (
            <div key={i} className="row gap12" style={{ padding: "10px 12px", borderRadius: 11, color: on ? "var(--ink)" : "var(--ink-2)", background: on ? "var(--bg-4)" : "transparent", boxShadow: on ? "inset 0 0 0 1px var(--line)" : "none" }}>
              <Icon name={ic} cls="sm" style={{ color: on ? "var(--accent)" : "currentColor" }} /><span className="grow" style={{ fontSize: 14.5 }}>{l}</span>
              {badge && <span className="chip chip--terra" style={{ fontSize: 10, padding: "0 7px" }}>{badge}</span>}
            </div>
          ))}
        </nav>
        <div className="grow" />
        <div className="row gap10" style={{ padding: "10px 8px" }}><Avatar name="Admin YV" tone="t" size={32} /><div className="grow"><div style={{ fontSize: 13.5 }}>Admin</div><div className="faint mono" style={{ fontSize: 10 }}>root@yourvivac</div></div></div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header className="spread" style={{ padding: "20px 28px", boxShadow: "inset 0 -1px 0 var(--line)", flex: "none" }}>
          <div><div className="eyebrow">Panel de administración</div><h2 style={{ fontSize: 24, marginTop: 4 }}>Resumen</h2></div>
          <div className="row gap12">
            <div className="row gap10" style={{ background: "var(--bg-2)", borderRadius: 11, padding: "9px 14px", boxShadow: "inset 0 0 0 1px var(--line)", width: 220 }}><Icon name="search" cls="sm" style={{ color: "var(--ink-3)" }} /><span className="faint" style={{ fontSize: 14 }}>Buscar usuario…</span></div>
            <span className="mono faint" style={{ fontSize: 12.5, alignSelf: "center" }}>4 jun 2026</span>
          </div>
        </header>

        <div style={{ flex: 1, overflow: "hidden", padding: "22px 28px" }}>
          {/* KPIs */}
          <div className="row gap16" style={{ marginBottom: 22 }}>
            {kpis.map(([l, n, d, c], i) => (
              <div key={i} className="card grow" style={{ padding: "16px 18px" }}>
                <div className="eyebrow">{l}</div>
                <div className="mono" style={{ fontSize: 30, marginTop: 6, color: c }}>{n}</div>
                <div className="faint mono" style={{ fontSize: 11.5, marginTop: 4 }}>{d}</div>
              </div>
            ))}
          </div>

          <div className="row gap20" style={{ alignItems: "flex-start" }}>
            {/* cola de verificación de guías */}
            <div className="card grow" style={{ overflow: "hidden" }}>
              <div className="spread" style={{ padding: "15px 18px", boxShadow: "inset 0 -1px 0 var(--line)" }}>
                <div className="row gap8"><Icon name="shield" cls="sm" style={{ color: "var(--terra)" }} /><h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Verificación de guías</h3></div>
                <span className="chip chip--terra">4 pendientes</span>
              </div>
              <div style={{ padding: "4px 18px 12px" }}>
                <div className="row mono faint" style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "10px 0 8px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ flex: 2 }}>Solicitante</span><span style={{ flex: 2 }}>Certificación</span><span style={{ width: 60 }}>Fecha</span><span style={{ width: 110, textAlign: "right" }}>Acción</span>
                </div>
                {queue.map((q, i) => (
                  <div key={i} className="row" style={{ padding: "12px 0", borderBottom: i < queue.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <div className="row gap10" style={{ flex: 2, minWidth: 0 }}><Avatar name={q.n} tone={i === 1 ? "s" : "t"} size={32} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 14 }}>{q.n}</div><div className="faint mono" style={{ fontSize: 10.5 }}>{q.mail}</div></div></div>
                    <div style={{ flex: 2 }}><span className="chip" style={{ fontSize: 10.5 }}>{q.cert}</span></div>
                    <span className="faint mono" style={{ width: 60, fontSize: 12, alignSelf: "center" }}>{q.date}</span>
                    <div className="row gap6" style={{ width: 110, justifyContent: "flex-end" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center" }}><Icon name="check" cls="sm" /></span>
                      <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--ink-2)", boxShadow: "inset 0 0 0 1px var(--line)" }}><Icon name="x" cls="sm" /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* reportes + actividad */}
            <div style={{ width: 300, flex: "none" }} className="stack gap16">
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="spread" style={{ padding: "14px 16px", boxShadow: "inset 0 -1px 0 var(--line)" }}><div className="row gap8"><Icon name="flag" cls="sm" style={{ color: "var(--terra)" }} /><h3 style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Reportes</h3></div></div>
                <div style={{ padding: "4px 16px 10px" }}>
                  {reports.map(([t, src, st], i) => (
                    <div key={i} className="row gap10" style={{ padding: "11px 0", borderBottom: i < reports.length - 1 ? "1px solid var(--line)" : "none" }}>
                      <div className="grow"><div style={{ fontSize: 13.5 }}>{t}</div><div className="faint mono" style={{ fontSize: 10.5, marginTop: 2 }}>{src}</div></div>
                      <span className={`chip ${st === "Resuelto" ? "chip--accent" : "chip--terra"}`} style={{ fontSize: 10 }}>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: "16px 18px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, marginBottom: 12 }}>Nuevos usuarios</h3>
                {/* mini gráfico de barras */}
                <div className="row gap6" style={{ alignItems: "flex-end", height: 80 }}>
                  {[40, 55, 38, 70, 62, 88, 75].map((h, i) => (
                    <div key={i} className="grow" style={{ height: `${h}%`, borderRadius: 4, background: i === 5 ? "var(--accent)" : "var(--bg-4)", boxShadow: i === 5 ? "none" : "inset 0 0 0 1px var(--line)" }} />
                  ))}
                </div>
                <div className="row spread mono faint" style={{ fontSize: 10, marginTop: 6 }}><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { TipCard, ExploreScreen, TeamScreen, TipsScreen, PublishTipModal, SettingsScreen, AdminPanel });
