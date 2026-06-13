/* ============================================================
   YourVivac — Tablero y pines
   BoardFree · BoardWall · BoardGuided
   GearListScreen · NoteScreen · MapScreen · ChatScreen
   ============================================================ */

/* ---- Cabecera de excursión + segmento Chat|Tablero ---- */
function BoardHeader({ tab = "tablero" }) {
  return (
    <header style={{ flex: "none", padding: "4px 16px 0" }}>
      <div className="spread">
        <div className="row gap10">
          <Icon name="back" cls="lg" />
          <div>
            <h3 style={{ fontSize: 18 }}>Vivac en el Aneto</h3>
            <div className="faint mono" style={{ fontSize: 11 }}>14–15 JUN · 4 montañeros</div>
          </div>
        </div>
        <div className="row" style={{ paddingRight: 4 }}>
          {[["Marcos", ""], ["Lucía", "t"], ["Iker", "s"], ["Ana", ""]].map(([n, t], i) => (
            <Avatar key={i} name={n} tone={t} size={28} ring style={{ marginLeft: -7 }} />
          ))}
        </div>
      </div>
      <div className="row gap6" style={{ marginTop: 12, background: "var(--bg-2)", padding: 4, borderRadius: 12, boxShadow: "inset 0 0 0 1px var(--line)" }}>
        {["Tablero", "Chat", "Ruta"].map(s => {
          const on = s.toLowerCase() === tab;
          return <button key={s} className="grow mono" style={{ border: "none", borderRadius: 9, padding: "8px 0", fontSize: 12.5, letterSpacing: ".04em",
            background: on ? "var(--bg-4)" : "transparent", color: on ? "var(--ink)" : "var(--ink-3)", boxShadow: on ? "var(--shadow-sm)" : "none" }}>{s}</button>;
        })}
      </div>
    </header>
  );
}

/* ---- Cabeza reutilizable de un pin ---- */
function PinHead({ icon, who, tone, label }) {
  return (
    <div className="pin__head">
      <Icon name={icon} style={{ width: 13, height: 13, color: "currentColor" }} /> {label}
      <span className="grow" />
      <Avatar name={who} tone={tone} size={16} style={{ fontSize: 8 }} />
    </div>
  );
}

/* ---- Pines individuales (para mural libre) ---- */
function NotePin(props) {
  return (
    <div className="pin pin--paper" style={props.style}>
      <span className="pin__tack" />
      <PinHead icon="note" who="Lucía" tone="t" label="Nota · MD" />
      <div className="pin__body note-md" style={{ fontSize: 13 }}>
        <h4>Plan de cumbre ⛰️</h4>
        <p>Salida del refu a las <strong>6:00</strong>. Portar frontal.</p>
        <ul><li>Tramo glaciar → crampones</li><li>Paso de Mahoma con cuidado</li></ul>
        <p style={{ marginBottom: 0 }}>Ver <a>parte de AEMET</a></p>
      </div>
    </div>
  );
}
function PhotoPin(props) {
  return (
    <div className="pin" style={{ overflow: "hidden", ...props.style }}>
      <span className="pin__tack sky" />
      <div className="imgslot topo" style={{ height: 116, alignItems: "flex-end" }}>
        <span className="imgslot__tag">foto · la renclusa</span>
      </div>
      <div className="pin__body" style={{ padding: "8px 11px 10px" }}>
        <div className="row gap6 faint mono" style={{ fontSize: 10 }}><Avatar name="Iker" tone="s" size={15} style={{ fontSize: 8 }} /> Iker · ayer</div>
      </div>
    </div>
  );
}
function LinkPin(props) {
  return (
    <div className="pin" style={props.style}>
      <span className="pin__tack" />
      <PinHead icon="link" who="Marcos" tone="" label="Enlace" />
      <div className="pin__body">
        <div className="imgslot topo" style={{ height: 64, borderRadius: 7, marginBottom: 8 }} />
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, lineHeight: 1.1 }}>Refugio de la Renclusa</div>
        <div className="faint mono row gap4" style={{ fontSize: 10, marginTop: 4 }}><Icon name="globe" style={{ width: 11, height: 11 }} /> alberges.com</div>
      </div>
    </div>
  );
}
function ListPinMini(props) {
  const items = [["Saco -5 ºC", "amazon"], ["Esterilla", "decath"], ["Hornillo", "deporv"]];
  return (
    <div className="pin" style={props.style}>
      <span className="pin__tack green" />
      <PinHead icon="list" who="Marcos" tone="" label="Mi lista" />
      <div className="pin__body" style={{ paddingTop: 4 }}>
        {items.map(([t, s], i) => (
          <div key={i} className="row gap8" style={{ padding: "5px 0", borderBottom: i < 2 ? "1px solid var(--line)" : "none" }}>
            <span className="gear-check" style={{ width: 15, height: 15 }} />
            <span className="grow" style={{ fontSize: 12.5 }}>{t}</span>
            <span className={`store store--${s}`} style={{ fontSize: 9 }}>{s === "decath" ? "Decathlon" : s === "deporv" ? "Deporvil." : "Amazon"}</span>
          </div>
        ))}
        <button className="btn btn--ghost" style={{ width: "100%", marginTop: 10, fontSize: 12, padding: "7px 0" }}>+ Añade tu lista</button>
      </div>
    </div>
  );
}
function MapPin(props) {
  return (
    <div className="pin" style={props.style}>
      <span className="pin__tack sky" />
      <PinHead icon="pin" who="Ana" tone="" label="Ubicación" />
      <div className="pin__body">
        <div className="map" style={{ height: 96 }}>
          <svg className="map__route" viewBox="0 0 180 96" preserveAspectRatio="none"><path d="M20 80 C60 70 70 30 110 34 S160 30 168 18" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeDasharray="2 5" strokeLinecap="round" /></svg>
          <div className="map__pin"><Icon name="pin" style={{ width: 22, height: 22, color: "var(--terra)", fill: "var(--terra)", stroke: "var(--bg)" }} /></div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginTop: 7 }}>Pico Aneto</div>
        <div className="faint mono" style={{ fontSize: 10, marginTop: 2 }}>42.6318, 0.6577 · Google Maps</div>
      </div>
    </div>
  );
}
function TextPin(props) {
  return (
    <div className="pin pin--paper" style={{ background: "var(--accent)", color: "#15200d", ...props.style }}>
      <span className="pin__tack" />
      <div className="pin__body" style={{ paddingTop: 14 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, marginBottom: 4 }}>¿Coche compartido?</div>
        <p style={{ fontSize: 12.5 }}>Salgo de Jaca el viernes a las 16h. Caben 3 🚗</p>
        <div className="row gap4 mono" style={{ fontSize: 10, marginTop: 8, opacity: .7 }}><Icon name="heart" style={{ width: 12, height: 12 }} /> 2 · Ana, Iker</div>
      </div>
    </div>
  );
}

/* ---------------- VARIACIÓN A · Mural corcho libre ---------------- */
function BoardFree() {
  return (
    <div className="screen">
      <BoardHeader tab="tablero" />
      <div className="grow" style={{ position: "relative", margin: "12px 0 0" }}>
        <div className="board">
          <NotePin style={{ left: 12, top: 10, width: 178, transform: "rotate(-2.2deg)" }} />
          <PhotoPin style={{ right: 12, top: 26, width: 166, transform: "rotate(2deg)" }} />
          <LinkPin style={{ right: 14, top: 226, width: 168, transform: "rotate(-2deg)" }} />
          <MapPin style={{ left: 14, top: 250, width: 182, transform: "rotate(1.4deg)" }} />
          <TextPin style={{ right: 16, top: 452, width: 162, transform: "rotate(2.4deg)" }} />
          <ListPinMini style={{ left: 12, top: 486, width: 182, transform: "rotate(-1.4deg)" }} />
        </div>
        {/* FAB añadir pin */}
        <button className="btn" style={{ position: "absolute", right: 16, bottom: 18, borderRadius: 16, padding: "13px 18px", boxShadow: "var(--shadow)" }}>
          <Icon name="plus" cls="sm" /> Añadir pin
        </button>
      </div>
    </div>
  );
}

/* ---------------- VARIACIÓN B · Muro ordenado (masonry) ---------------- */
function BoardWall() {
  return (
    <div className="screen">
      <BoardHeader tab="tablero" />
      <div className="screen__scroll" style={{ padding: "12px 14px" }}>
        <div className="spread" style={{ marginBottom: 12 }}>
          <span className="eyebrow">18 pines · ordenado</span>
          <span className="row gap6">
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--bg-3)", display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 1px var(--line)" }}><Icon name="grid" cls="sm" /></span>
            <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--ink-3)" }}><Icon name="filter" cls="sm" /></span>
          </span>
        </div>
        <div style={{ columnCount: 2, columnGap: 10 }}>
          {[
            <div className="card" style={{ overflow: "hidden", marginBottom: 10, breakInside: "avoid" }}>
              <div className="imgslot topo" style={{ height: 120, alignItems: "flex-end" }}><span className="imgslot__tag">foto · cresta</span></div>
              <div style={{ padding: "8px 10px" }}><div className="faint mono row gap4" style={{ fontSize: 10 }}><Avatar name="Iker" tone="s" size={14} style={{ fontSize: 7 }} /> Iker</div></div>
            </div>,
            <div className="card pin--paper note-md" style={{ padding: "11px 12px", marginBottom: 10, breakInside: "avoid", fontSize: 12.5 }}>
              <div className="pin__head" style={{ padding: 0, marginBottom: 6 }}><Icon name="note" style={{ width: 12, height: 12 }} /> Nota · MD</div>
              <h4>Plan de cumbre</h4><p style={{ marginBottom: 0 }}>Salida 6:00. <strong>Crampones</strong> para el glaciar.</p>
            </div>,
            <div className="card" style={{ padding: "11px 12px", marginBottom: 10, breakInside: "avoid" }}>
              <div className="pin__head" style={{ padding: 0, marginBottom: 8 }}><Icon name="list" style={{ width: 12, height: 12 }} /> Lista · Marcos</div>
              {["Saco -5 ºC", "Esterilla", "Frontal"].map((t, i) => (
                <div key={i} className="row gap8" style={{ padding: "4px 0" }}><span className="gear-check" style={{ width: 14, height: 14 }} /><span style={{ fontSize: 12.5 }} className="grow">{t}</span></div>
              ))}
            </div>,
            <div className="card" style={{ overflow: "hidden", marginBottom: 10, breakInside: "avoid" }}>
              <div className="map" style={{ height: 110, borderRadius: 0 }}><div className="map__pin"><Icon name="pin" style={{ width: 20, height: 20, color: "var(--terra)", fill: "var(--terra)", stroke: "var(--bg)" }} /></div></div>
              <div style={{ padding: "8px 10px" }}><div style={{ fontFamily: "var(--font-display)", fontSize: 13 }}>Pico Aneto</div><div className="faint mono" style={{ fontSize: 9.5 }}>Google Maps</div></div>
            </div>,
            <div className="card" style={{ padding: "11px 12px", marginBottom: 10, breakInside: "avoid" }}>
              <div className="pin__head" style={{ padding: 0, marginBottom: 8 }}><Icon name="link" style={{ width: 12, height: 12 }} /> Enlace</div>
              <div className="imgslot topo" style={{ height: 52, borderRadius: 6, marginBottom: 7 }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13 }}>Refugio Renclusa</div>
            </div>,
            <div className="card" style={{ padding: "11px 12px", marginBottom: 10, breakInside: "avoid", background: "var(--accent)", color: "#15200d" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginBottom: 3 }}>¿Coche compartido?</div>
              <p style={{ fontSize: 12 }}>Salgo de Jaca el viernes 16h.</p>
            </div>,
          ].map((el, i) => React.cloneElement(el, { key: i }))}
        </div>
      </div>
      <button className="btn" style={{ position: "absolute", right: 16, bottom: 18, borderRadius: 16, padding: "13px 18px", boxShadow: "var(--shadow)" }}>
        <Icon name="plus" cls="sm" /> Añadir pin
      </button>
    </div>
  );
}

/* ---------------- VARIACIÓN C · Feed guiado ---------------- */
function BoardGuided() {
  const Group = ({ icon, title, count, children }) => (
    <section style={{ marginBottom: 18 }}>
      <div className="row gap8" style={{ marginBottom: 10 }}>
        <Icon name={icon} cls="sm" style={{ color: "var(--accent)" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{title}</span>
        <span className="chip mono" style={{ fontSize: 10, padding: "1px 7px" }}>{count}</span>
      </div>
      {children}
    </section>
  );
  return (
    <div className="screen">
      <BoardHeader tab="tablero" />
      <div className="screen__scroll" style={{ padding: "14px 16px" }}>
        <Group icon="list" title="Equipo" count="3 listas">
          <div className="card" style={{ padding: 12 }}>
            {[["Marcos", "", "12 ítems · 6,4 kg"], ["Lucía", "t", "9 ítems · 5,1 kg"]].map(([n, t, s], i) => (
              <div key={i} className="row gap10" style={{ padding: "8px 0", borderBottom: i < 1 ? "1px solid var(--line)" : "none" }}>
                <Avatar name={n} tone={t} size={30} />
                <div className="grow"><div style={{ fontSize: 14 }}>Lista de {n}</div><div className="faint mono" style={{ fontSize: 10.5 }}>{s}</div></div>
                <Icon name="chevron" cls="sm" style={{ color: "var(--ink-3)" }} />
              </div>
            ))}
            <button className="btn btn--ghost btn--block" style={{ marginTop: 10, fontSize: 13 }}>+ Añade tu lista al tablero</button>
          </div>
        </Group>
        <Group icon="image" title="Fotos y enlaces" count="6">
          <div className="row gap10" style={{ overflow: "hidden" }}>
            <div className="imgslot topo none" style={{ height: 100, width: 120, borderRadius: 12, alignItems: "flex-end" }}><span className="imgslot__tag">cresta</span></div>
            <div className="imgslot topo none" style={{ height: 100, width: 120, borderRadius: 12, alignItems: "flex-end" }}><span className="imgslot__tag">refugio</span></div>
            <div className="card none" style={{ height: 100, width: 110, padding: 10 }}><div className="pin__head" style={{ padding: 0 }}><Icon name="link" style={{ width: 11, height: 11 }} /> Enlace</div><div style={{ fontFamily: "var(--font-display)", fontSize: 12.5, marginTop: 6 }}>Refugio Renclusa</div></div>
          </div>
        </Group>
        <Group icon="note" title="Notas" count="4">
          <div className="card pin--paper note-md" style={{ padding: 13, fontSize: 13 }}>
            <h4>Plan de cumbre ⛰️</h4>
            <p>Salida del refu a las <strong>6:00</strong>. Tramo glaciar con crampones; cuidado en el Paso de Mahoma.</p>
            <p style={{ marginBottom: 0 }}>Ver <a>parte de AEMET</a></p>
          </div>
        </Group>
        <Group icon="pin" title="Mapa" count="2">
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="map" style={{ height: 120, borderRadius: 0 }}>
              <svg className="map__route" viewBox="0 0 360 120" preserveAspectRatio="none"><path d="M30 100 C120 88 130 40 210 44 S320 30 340 22" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeDasharray="2 6" strokeLinecap="round" /></svg>
              <div className="map__pin"><Icon name="pin" style={{ width: 22, height: 22, color: "var(--terra)", fill: "var(--terra)", stroke: "var(--bg)" }} /></div>
            </div>
            <div className="spread" style={{ padding: "10px 12px" }}><div><div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>Pico Aneto</div><div className="faint mono" style={{ fontSize: 10 }}>42.6318, 0.6577</div></div><span className="chip chip--accent">Abrir</span></div>
          </div>
        </Group>
      </div>
      <button className="btn" style={{ position: "absolute", right: 16, bottom: 18, borderRadius: 16, padding: "13px 18px", boxShadow: "var(--shadow)" }}>
        <Icon name="plus" cls="sm" /> Añadir pin
      </button>
    </div>
  );
}

/* ---------------- PIN DE LISTA · productos + tiendas ---------------- */
function GearListScreen() {
  const items = [
    { t: "Saco de dormir -5 ºC", w: "1.180 g", store: "amazon", label: "Amazon", price: "129 €", on: true },
    { t: "Esterilla inflable", w: "480 g", store: "decath", label: "Decathlon", price: "59,99 €", on: true },
    { t: "Hornillo de gas", w: "73 g", store: "deporv", label: "Deporvillage", price: "44 €", on: true },
    { t: "Frontal recargable", w: "98 g", store: "barrabes", label: "Barrabés", price: "55 €", on: false },
    { t: "Crampones acero", w: "920 g", store: "barrabes", label: "Barrabés", price: "139 €", on: false },
    { t: "Chaqueta plumas", w: "340 g", store: "forum", label: "Forum Sport", price: "189 €", on: false },
    { t: "Bidón 1 L", w: "120 g", store: "coleman", label: "Coleman", price: "12,95 €", on: false },
  ];
  return (
    <div className="screen">
      <AppBar title="Lista de Marcos" sub="Pin de equipo · visible para el grupo" right={<Icon name="share" />} />
      <div style={{ padding: "0 18px 12px", flex: "none" }}>
        <div className="card row" style={{ padding: "12px 14px", gap: 0 }}>
          <Stat n="3/7" label="Listo" tone="var(--accent)" />
          <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch" }} />
          <Stat n="6,4" label="kg total" />
          <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch" }} />
          <Stat n="494 €" label="Estimado" tone="var(--terra)" />
        </div>
      </div>
      <div className="screen__scroll" style={{ padding: "0 18px 16px" }}>
        {items.map((it, i) => (
          <div key={i} className="row gap12" style={{ padding: "11px 0", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none" }}>
            <span className={`gear-check ${it.on ? "on" : ""}`}>{it.on && <Icon name="check" style={{ width: 13, height: 13, color: "var(--accent-ink)" }} />}</span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, textDecoration: it.on ? "none" : "none" }}>{it.t}</div>
              <div className="row gap8" style={{ marginTop: 5 }}>
                <span className={`store store--${it.store}`}>{it.label}</span>
                <span className="faint mono" style={{ fontSize: 11 }}>{it.w} · {it.price}</span>
              </div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", color: "var(--ink-2)", boxShadow: "inset 0 0 0 1px var(--line)" }}>
              <Icon name="link" cls="sm" />
            </div>
          </div>
        ))}
        {/* buscador unificado */}
        <div className="card" style={{ marginTop: 16, padding: 14, background: "var(--bg-3)" }}>
          <div className="row gap8"><Icon name="search" cls="sm" style={{ color: "var(--accent)" }} /><strong style={{ fontSize: 14 }}>Buscar en todas las tiendas</strong></div>
          <p className="faint" style={{ fontSize: 12.5, marginTop: 6 }}>Un solo buscador para Amazon, Decathlon, Deporvillage, Barrabés, Forum Sport y Coleman. Compara precio y peso antes de añadir.</p>
          <div className="row gap6 wrap" style={{ marginTop: 10 }}>
            {["amazon|Amazon", "decath|Decathlon", "deporv|Deporvillage", "barrabes|Barrabés", "forum|Forum", "coleman|Coleman"].map((s, i) => {
              const [k, l] = s.split("|"); return <span key={i} className={`store store--${k}`}>{l}</span>;
            })}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 18px", background: "var(--bg-2)", boxShadow: "inset 0 1px 0 var(--line)", flex: "none" }}>
        <button className="btn btn--block btn--lg"><Icon name="plus" cls="sm" /> Añadir elemento</button>
      </div>
    </div>
  );
}

/* ---------------- NOTA MARKDOWN (editor) ---------------- */
function NoteScreen() {
  return (
    <div className="screen">
      <AppBar title="Nota" sub="Pin de texto · Markdown" right={<span className="chip chip--accent">Guardar</span>} />
      <div className="row gap6" style={{ padding: "0 18px 10px", flex: "none" }}>
        <span className="chip chip--accent">Vista previa</span><span className="chip">Editar MD</span>
      </div>
      <div className="screen__scroll" style={{ padding: "0 18px 16px" }}>
        <div className="card note-md" style={{ padding: "18px 18px", fontSize: 15 }}>
          <h4 style={{ fontSize: 22 }}>Plan de cumbre ⛰️</h4>
          <p>Salida del refugio a las <strong>6:00</strong>. Llevad frontal y algo caliente para el desayuno.</p>
          <h4 style={{ fontSize: 17, marginTop: 14 }}>Tramos clave</h4>
          <ul>
            <li>Glaciar de Aneto → <strong>crampones y piolet</strong></li>
            <li>Paso de Mahoma → de uno en uno, con calma</li>
            <li>Vuelta antes de las <code>14:00</code> por tormentas</li>
          </ul>
          <p>Parte del tiempo: <a>aemet.es/montaña</a></p>
          <hr className="hr" style={{ margin: "14px 0" }} />
          <p className="faint" style={{ fontSize: 13 }}>Editado por Lucía · hace 1 h</p>
        </div>
        {/* barra markdown */}
        <div className="row gap6 wrap" style={{ marginTop: 14 }}>
          {[["# ", "Título"], ["**", "Negrita"], ["- ", "Lista"], ["[]", "Enlace"], ["`", "Código"], ["> ", "Cita"]].map(([s, l], i) => (
            <span key={i} className="chip mono"><b style={{ fontFamily: "var(--font-mono)" }}>{s.trim() || "·"}</b> {l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAPA (ubicación Google Maps) ---------------- */
function MapScreen() {
  return (
    <div className="screen">
      <div className="map" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>
        <svg className="map__route" viewBox="0 0 390 700" preserveAspectRatio="none">
          <path d="M70 600 C140 540 120 420 200 400 S320 320 300 220 360 120 330 70" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="3 8" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: "80%", top: "32%" }}><Icon name="pin" style={{ width: 30, height: 30, color: "var(--terra)", fill: "var(--terra)", stroke: "var(--bg)" }} /></div>
        <div style={{ position: "absolute", left: "16%", top: "84%" }}><span style={{ display: "block", width: 16, height: 16, borderRadius: 9, background: "var(--sky)", boxShadow: "0 0 0 4px color-mix(in srgb,var(--sky) 30%,transparent)" }} /></div>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}><AppBar title="" left={<span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--bg-2)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-sm)" }}><Icon name="back" cls="sm" /></span>} right={<span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--bg-2)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-sm)" }}><Icon name="layers" cls="sm" /></span>} /></div>

      {/* ficha inferior */}
      <div style={{ marginTop: "auto", position: "relative", zIndex: 2, padding: 14 }}>
        <div className="card" style={{ padding: 16, background: "var(--bg-2)", boxShadow: "var(--shadow)" }}>
          <div className="spread">
            <div><div className="eyebrow">Pin de ubicación</div><h3 style={{ fontSize: 22, marginTop: 4 }}>Pico Aneto</h3></div>
            <span className="chip chip--terra"><Icon name="elev" style={{ width: 12, height: 12 }} /> 3.404 m</span>
          </div>
          <div className="row gap10 mono faint" style={{ fontSize: 12, marginTop: 8 }}><Icon name="pin" style={{ width: 13, height: 13 }} /> 42.6318, 0.6577</div>
          <div className="row gap8" style={{ marginTop: 14 }}>
            <button className="btn grow"><Icon name="route" cls="sm" /> Cómo llegar</button>
            <button className="btn btn--ghost grow"><Icon name="globe" cls="sm" /> Google Maps</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CHAT DEL GRUPO ---------------- */
function ChatScreen() {
  const Msg = ({ who, tone, time, children, me }) => (
    <div className="row" style={{ gap: 8, alignItems: "flex-end", flexDirection: me ? "row-reverse" : "row", marginBottom: 12 }}>
      {!me && <Avatar name={who} tone={tone} size={28} />}
      <div style={{ maxWidth: 230 }}>
        {!me && <div className="faint mono" style={{ fontSize: 10, margin: "0 0 3px 4px" }}>{who}</div>}
        <div style={{ padding: "9px 13px", borderRadius: 16, fontSize: 14.5, lineHeight: 1.4,
          background: me ? "var(--accent)" : "var(--bg-3)", color: me ? "var(--accent-ink)" : "var(--ink)",
          borderBottomRightRadius: me ? 5 : 16, borderBottomLeftRadius: me ? 16 : 5, boxShadow: me ? "none" : "inset 0 0 0 1px var(--line)" }}>{children}</div>
        <div className="faint mono" style={{ fontSize: 9.5, textAlign: me ? "right" : "left", margin: "3px 4px 0" }}>{time}</div>
      </div>
    </div>
  );
  return (
    <div className="screen">
      <BoardHeader tab="chat" />
      <div className="screen__scroll" style={{ padding: "16px 16px 8px" }}>
        <div className="stack" style={{ alignItems: "center", marginBottom: 16 }}><span className="chip mono" style={{ fontSize: 10 }}>HOY</span></div>
        <Msg who="Lucía Roldán" tone="t" time="9:12">¿Confirmamos el refugio para el viernes? 🏔️</Msg>
        <Msg who="Iker Mendi" tone="s" time="9:14">Yo me encargo de reservar. Somos 4, ¿no?</Msg>
        <Msg me time="9:15">Sí, 4. Acabo de pinear mi lista de equipo en el tablero 👀</Msg>
        {/* tarjeta de pin compartido en el chat */}
        <div className="row" style={{ justifyContent: "flex-end", marginBottom: 12 }}>
          <div className="card" style={{ width: 220, overflow: "hidden", background: "var(--bg-3)" }}>
            <div className="pin__head"><Icon name="list" style={{ width: 12, height: 12 }} /> Pin · Lista de Marcos</div>
            <div style={{ padding: "4px 12px 12px" }}>
              {["Saco -5 ºC", "Esterilla", "Hornillo"].map((t, i) => <div key={i} className="row gap8" style={{ padding: "3px 0" }}><span className="gear-check" style={{ width: 13, height: 13 }} /><span style={{ fontSize: 12.5 }} className="grow">{t}</span></div>)}
              <button className="btn btn--ghost btn--block" style={{ marginTop: 8, fontSize: 12, padding: "6px 0" }}>Abrir en el tablero</button>
            </div>
          </div>
        </div>
        <Msg who="Ana Gil" tone="" time="9:20">¡Genial! Yo añadí el mapa con la ubicación del vivac 📍</Msg>
      </div>
      <div className="row gap10" style={{ padding: "10px 14px", background: "var(--bg-2)", boxShadow: "inset 0 1px 0 var(--line)", flex: "none" }}>
        <Icon name="plus" style={{ color: "var(--ink-3)" }} />
        <div className="grow row" style={{ background: "var(--bg-3)", borderRadius: 18, padding: "9px 14px", boxShadow: "inset 0 0 0 1px var(--line)" }}>
          <span className="faint" style={{ fontSize: 14.5 }}>Mensaje al grupo…</span>
        </div>
        <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center" }}><Icon name="send" cls="sm" /></span>
      </div>
    </div>
  );
}

Object.assign(window, { BoardFree, BoardWall, BoardGuided, GearListScreen, NoteScreen, MapScreen, ChatScreen });
