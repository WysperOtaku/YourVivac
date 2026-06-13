/* ============================================================
   YourVivac — Adaptación a escritorio
   DeskHome · DeskBoard  (1440 px)
   ============================================================ */

function DeskShell({ active = "home", children, theme, type, density }) {
  const nav = [
    ["home", "Inicio"], ["compass", "Explorar"], ["layers", "Salidas"],
    ["list", "Mi equipo"], ["note", "Consejos"], ["user", "Perfil"],
  ];
  return (
    <div className="yv" data-theme={theme} data-type={type} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", background: "var(--bg)", overflow: "hidden" }}>
      {/* rail izquierdo */}
      <aside style={{ width: 240, flex: "none", background: "var(--bg-2)", boxShadow: "inset -1px 0 0 var(--line)", padding: "26px 18px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 8px 22px" }}><Logo size={21} /></div>
        <button className="btn btn--block" style={{ marginBottom: 22 }}><Icon name="plus" cls="sm" /> Nueva salida</button>
        <nav className="stack gap2">
          {nav.map(([ic, l]) => {
            const on = active === ic;
            return (
              <div key={ic} className="row gap12" style={{ padding: "10px 12px", borderRadius: 11, color: on ? "var(--ink)" : "var(--ink-2)",
                background: on ? "var(--bg-4)" : "transparent", boxShadow: on ? "inset 0 0 0 1px var(--line)" : "none" }}>
                <Icon name={ic} cls="sm" style={{ color: on ? "var(--accent)" : "currentColor" }} />
                <span style={{ fontSize: 15 }}>{l}</span>
              </div>
            );
          })}
        </nav>
        <div className="grow" />
        <div className="row gap10" style={{ padding: "10px 8px", borderRadius: 12, boxShadow: "inset 0 0 0 1px var(--line)" }}>
          <Avatar name="Marcos Vidal" size={34} />
          <div className="grow" style={{ minWidth: 0 }}><div style={{ fontSize: 14 }}>Marcos Vidal</div><div className="faint mono" style={{ fontSize: 10.5 }}>38 salidas</div></div>
          <Icon name="settings" cls="sm" style={{ color: "var(--ink-3)" }} />
        </div>
      </aside>
      <main style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
}

function DeskTopbar({ title, sub, children }) {
  return (
    <header className="spread" style={{ padding: "20px 28px", flex: "none", boxShadow: "inset 0 -1px 0 var(--line)" }}>
      <div><div className="eyebrow">{sub}</div><h2 style={{ fontSize: 25, marginTop: 4 }}>{title}</h2></div>
      <div className="row gap14">
        <div className="row gap10" style={{ background: "var(--bg-2)", borderRadius: 11, padding: "9px 14px", boxShadow: "inset 0 0 0 1px var(--line)", width: 240 }}>
          <Icon name="search" cls="sm" style={{ color: "var(--ink-3)" }} /><span className="faint" style={{ fontSize: 14 }}>Buscar…</span>
        </div>
        <Icon name="bell" /><Avatar name="Marcos Vidal" size={36} />
        {children}
      </div>
    </header>
  );
}

/* ---------------- HOME ESCRITORIO ---------------- */
function DeskHome(props) {
  return (
    <DeskShell active="home" {...props}>
      <DeskTopbar title="Hola, Marcos" sub="Tu cordada · 2 salidas en preparación" />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* centro */}
        <div style={{ flex: 1, overflow: "hidden", padding: "22px 28px" }}>
          <div className="spread" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>Tus salidas</h3>
            <span className="faint row gap4" style={{ fontSize: 13 }}>Ver todas <Icon name="chevron" cls="sm" style={{ width: 13, height: 13 }} /></span>
          </div>
          <div className="row gap16" style={{ marginBottom: 26 }}>
            <TripCard name="Vivac en el Aneto" place="Benasque, Huesca" date="14 JUN" m="1.180" dist="22" status="Confirmada"
              members={[{ n: "Marcos", t: "" }, { n: "Lucía", t: "t" }, { n: "Iker", t: "s" }, { n: "Ana", t: "" }]} />
            <TripCard name="Travesía GR-11" place="Pirineo navarro" date="2 JUL" m="2.400" dist="48" status="Planeando"
              members={[{ n: "Marcos", t: "" }, { n: "Bea", t: "t" }]} />
          </div>
          <h3 style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--ink-3)", marginBottom: 14 }}>De tu cordada</h3>
          <div style={{ columnCount: 2, columnGap: 16 }}>
            <div style={{ breakInside: "avoid" }}><FeedCard who="Lucía Roldán" tone="t" guide place="Pico Aneto · 3.404 m" name="Amanecer en el Aneto" m="1.420" dist="24" time="hace 2 días" kudos="34" comments="6" photo="cima del aneto" /></div>
            <div style={{ breakInside: "avoid" }}><FeedCard who="Iker Mendi" tone="s" place="Circo de Gredos" name="Vivac en la Laguna Grande" m="980" dist="17" time="hace 5 días" kudos="21" comments="3" photo="laguna al alba" /></div>
          </div>
        </div>
        {/* panel derecho */}
        <aside style={{ width: 300, flex: "none", boxShadow: "inset 1px 0 0 var(--line)", padding: "22px 22px", overflow: "hidden" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 14 }}>Ranking de la temporada</h3>
          <div className="card" style={{ padding: "6px 14px", marginBottom: 22 }}>
            {[["Lucía Roldán", "t", "22", true], ["Marcos Vidal", "", "18", false], ["Iker Mendi", "s", "15", false], ["Ana Gil", "", "11", false]].map(([n, t, c, g], i) => (
              <div key={i} className="row gap12" style={{ padding: "11px 0", borderBottom: i < 3 ? "1px solid var(--line)" : "none" }}>
                <span className="mono faint" style={{ width: 16, fontSize: 13 }}>{i + 1}</span>
                <Avatar name={n} tone={t} size={32} />
                <div className="grow row gap6" style={{ minWidth: 0 }}><span style={{ fontSize: 14 }}>{n.split(" ")[0]}</span>{g && <Icon name="shield" style={{ width: 13, height: 13, color: "var(--terra)" }} />}</div>
                <span className="mono" style={{ fontSize: 14, color: "var(--accent)" }}>{c}</span>
              </div>
            ))}
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 12 }}>Consejos para tu vivac</h3>
          <div className="stack gap10">
            {[["Elegir saco según la cota", "Lucía · Guía", true], ["Vivac responsable: no dejar rastro", "Editorial YV", false]].map(([t, a, g], i) => (
              <div key={i} className="card row gap10" style={{ padding: 12 }}>
                <div className="imgslot topo none" style={{ width: 48, height: 48, borderRadius: 10 }} />
                <div className="grow"><div style={{ fontSize: 14, fontFamily: "var(--font-display)", lineHeight: 1.1 }}>{t}</div><div className="faint mono row gap6" style={{ fontSize: 10.5, marginTop: 5 }}>{a} {g && <span className="chip chip--guide" style={{ fontSize: 8, padding: "1px 5px" }}>Guía</span>}</div></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </DeskShell>
  );
}

/* centros de tablero de escritorio (conmutables por tweak) */
function DeskBoardFree() {
  return (
    <div className="board">
      <NotePin style={{ left: 34, top: 28, width: 224, transform: "rotate(-2deg)" }} />
      <PhotoPin style={{ left: 290, top: 40, width: 220, transform: "rotate(1.6deg)" }} />
      <MapPin style={{ left: 548, top: 26, width: 240, transform: "rotate(-1.4deg)" }} />
      <LinkPin style={{ left: 30, top: 300, width: 224, transform: "rotate(1.4deg)" }} />
      <ListPinMini style={{ left: 292, top: 318, width: 226, transform: "rotate(-1.6deg)" }} />
      <TextPin style={{ left: 560, top: 320, width: 214, transform: "rotate(2deg)" }} />
      <PhotoPin style={{ left: 300, top: 560, width: 210, transform: "rotate(-1deg)" }} />
      <NotePin style={{ left: 560, top: 540, width: 220, transform: "rotate(1.4deg)" }} />
    </div>
  );
}
function DeskBoardWall() {
  const cards = [
    <div className="card" style={{ overflow: "hidden" }}><div className="imgslot topo" style={{ height: 150, alignItems: "flex-end" }}><span className="imgslot__tag">foto · cresta</span></div><div style={{ padding: "9px 12px" }} className="faint mono row gap6"><Avatar name="Iker" tone="s" size={16} style={{ fontSize: 8 }} /> Iker · ayer</div></div>,
    <div className="card pin--paper note-md" style={{ padding: 14, fontSize: 13.5 }}><div className="pin__head" style={{ padding: 0, marginBottom: 6 }}><Icon name="note" style={{ width: 12, height: 12 }} /> Nota · MD</div><h4>Plan de cumbre ⛰️</h4><p style={{ marginBottom: 0 }}>Salida 6:00. <strong>Crampones</strong> en el glaciar; Paso de Mahoma con calma.</p></div>,
    <div className="card" style={{ padding: 14 }}><div className="pin__head" style={{ padding: 0, marginBottom: 8 }}><Icon name="list" style={{ width: 12, height: 12 }} /> Lista · Marcos</div>{[["Saco -5 ºC", "amazon"], ["Esterilla", "decath"], ["Hornillo", "deporv"]].map(([t, s], i) => <div key={i} className="row gap8" style={{ padding: "5px 0" }}><span className="gear-check" style={{ width: 15, height: 15 }} /><span className="grow" style={{ fontSize: 13 }}>{t}</span><span className={`store store--${s}`} style={{ fontSize: 9 }}>{s === "decath" ? "Decathlon" : s === "deporv" ? "Deporvil." : "Amazon"}</span></div>)}</div>,
    <div className="card" style={{ overflow: "hidden" }}><div className="map" style={{ height: 150, borderRadius: 0 }}><div className="map__pin"><Icon name="pin" style={{ width: 22, height: 22, color: "var(--terra)", fill: "var(--terra)", stroke: "var(--bg)" }} /></div></div><div className="spread" style={{ padding: "9px 12px" }}><div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>Pico Aneto</div><span className="chip chip--accent">Abrir</span></div></div>,
    <div className="card" style={{ padding: 14 }}><div className="pin__head" style={{ padding: 0, marginBottom: 8 }}><Icon name="link" style={{ width: 12, height: 12 }} /> Enlace</div><div className="imgslot topo" style={{ height: 72, borderRadius: 7, marginBottom: 8 }} /><div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>Refugio de la Renclusa</div><div className="faint mono" style={{ fontSize: 10.5, marginTop: 3 }}>alberges.com</div></div>,
    <div className="card" style={{ padding: 14, background: "var(--accent)", color: "#15200d" }}><div style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>¿Coche compartido?</div><p style={{ fontSize: 13 }}>Salgo de Jaca el viernes a las 16h. Caben 3 🚗</p></div>,
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", padding: "24px 28px", background: "var(--bg)" }}>
      <div style={{ columnCount: 3, columnGap: 16 }}>
        {cards.map((c, i) => <div key={i} style={{ breakInside: "avoid", marginBottom: 16 }}>{c}</div>)}
      </div>
    </div>
  );
}
function DeskBoardGuided() {
  const Group = ({ icon, title, count, children }) => (
    <section style={{ marginBottom: 22 }}>
      <div className="row gap8" style={{ marginBottom: 12 }}><Icon name={icon} cls="sm" style={{ color: "var(--accent)" }} /><span style={{ fontFamily: "var(--font-display)", fontSize: 19 }}>{title}</span><span className="chip mono" style={{ fontSize: 10, padding: "1px 7px" }}>{count}</span></div>
      {children}
    </section>
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", padding: "24px 32px", background: "var(--bg)", maxWidth: 760 }}>
      <Group icon="list" title="Equipo del grupo" count="3 listas">
        <div className="card row gap16" style={{ padding: 16 }}>
          {[["Marcos", "", "12 ítems · 6,4 kg"], ["Lucía", "t", "9 ítems · 5,1 kg"], ["Iker", "s", "11 ítems · 7,0 kg"]].map(([n, t, s], i) => (
            <div key={i} className="grow row gap10"><Avatar name={n} tone={t} size={34} /><div><div style={{ fontSize: 14 }}>Lista de {n}</div><div className="faint mono" style={{ fontSize: 10.5 }}>{s}</div></div></div>
          ))}
        </div>
      </Group>
      <Group icon="image" title="Fotos y enlaces" count="6">
        <div className="row gap14">
          <div className="imgslot topo none" style={{ height: 120, width: 170, borderRadius: 12, alignItems: "flex-end" }}><span className="imgslot__tag">cresta</span></div>
          <div className="imgslot topo none" style={{ height: 120, width: 170, borderRadius: 12, alignItems: "flex-end" }}><span className="imgslot__tag">refugio</span></div>
          <div className="card none" style={{ height: 120, width: 160, padding: 12 }}><div className="pin__head" style={{ padding: 0 }}><Icon name="link" style={{ width: 11, height: 11 }} /> Enlace</div><div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginTop: 8 }}>Refugio Renclusa</div></div>
        </div>
      </Group>
      <Group icon="note" title="Notas" count="4">
        <div className="card pin--paper note-md" style={{ padding: 16, fontSize: 14 }}><h4>Plan de cumbre ⛰️</h4><p style={{ marginBottom: 0 }}>Salida del refu a las <strong>6:00</strong>. Tramo glaciar con crampones; cuidado en el Paso de Mahoma. Ver <a>parte de AEMET</a>.</p></div>
      </Group>
    </div>
  );
}

/* ---------------- TABLERO ESCRITORIO ---------------- */
function DeskBoard({ boardStyle = "free", ...props }) {
  const center = boardStyle === "wall" ? <DeskBoardWall /> : boardStyle === "guided" ? <DeskBoardGuided /> : <DeskBoardFree />;
  return (
    <DeskShell active="layers" {...props}>
      <DeskTopbar title="Vivac en el Aneto" sub="14–15 JUN · Benasque, Huesca">
        <div className="row" style={{ paddingRight: 4 }}>
          {[["Marcos", ""], ["Lucía", "t"], ["Iker", "s"], ["Ana", ""]].map(([n, t], i) => <Avatar key={i} name={n} tone={t} size={32} ring style={{ marginLeft: -7 }} />)}
        </div>
        <button className="btn"><Icon name="plus" cls="sm" /> Añadir pin</button>
      </DeskTopbar>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* tablero (estilo conmutables) */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {center}
        </div>
        {/* chat lateral */}
        <aside style={{ width: 330, flex: "none", boxShadow: "inset 1px 0 0 var(--line)", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
          <div className="spread" style={{ padding: "16px 18px", boxShadow: "inset 0 -1px 0 var(--line)", flex: "none" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Chat del grupo</h3>
            <Icon name="users" cls="sm" style={{ color: "var(--ink-3)" }} />
          </div>
          <div className="grow" style={{ padding: "16px 16px", overflow: "hidden" }}>
            {[["Lucía", "t", "¿Confirmamos el refugio para el viernes?"], ["Iker", "s", "Yo reservo. Somos 4 ✋"]].map(([n, t, m], i) => (
              <div key={i} className="row gap8" style={{ alignItems: "flex-end", marginBottom: 12 }}>
                <Avatar name={n} tone={t} size={26} />
                <div style={{ maxWidth: 210 }}><div className="faint mono" style={{ fontSize: 10, marginBottom: 3 }}>{n}</div><div style={{ padding: "9px 13px", borderRadius: 14, borderBottomLeftRadius: 5, background: "var(--bg-3)", fontSize: 14, boxShadow: "inset 0 0 0 1px var(--line)" }}>{m}</div></div>
              </div>
            ))}
            <div className="row" style={{ justifyContent: "flex-end", marginBottom: 12 }}>
              <div style={{ maxWidth: 210 }}><div style={{ padding: "9px 13px", borderRadius: 14, borderBottomRightRadius: 5, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14 }}>Pineé mi lista de equipo 👀</div></div>
            </div>
          </div>
          <div className="row gap8" style={{ padding: "12px 14px", boxShadow: "inset 0 1px 0 var(--line)", flex: "none" }}>
            <div className="grow row" style={{ background: "var(--bg-3)", borderRadius: 16, padding: "9px 14px", boxShadow: "inset 0 0 0 1px var(--line)" }}><span className="faint" style={{ fontSize: 14 }}>Mensaje…</span></div>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center" }}><Icon name="send" cls="sm" /></span>
          </div>
        </aside>
      </div>
    </DeskShell>
  );
}

Object.assign(window, { DeskShell, DeskHome, DeskBoard });
