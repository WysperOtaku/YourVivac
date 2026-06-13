/* ============================================================
   YourVivac — Pantallas móviles
   LoginScreen · HomeScreen · CreateScreen · ProfileScreen
   ============================================================ */

/* ---------------- LOGIN / AUTH GOOGLE ---------------- */
function LoginScreen() {
  return (
    <div className="screen" style={{ justifyContent: "space-between" }}>
      <div className="topo-bg" />
      {/* portada superior */}
      <div className="imgslot topo" style={{ position: "absolute", inset: 0, height: "52%", alignItems: "flex-start", maskImage: "linear-gradient(#000 58%, transparent)" }}>
        <span className="imgslot__tag" style={{ margin: "14px" }}>foto · vivac nocturno</span>
      </div>

      <div style={{ position: "relative", padding: "30px 28px 0" }}>
        <Logo size={20} />
      </div>

      <div style={{ position: "relative", marginTop: "auto", padding: "0 28px 30px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>El campamento base de tus salidas</div>
        <h1 style={{ fontSize: 44, lineHeight: 0.98, letterSpacing: "-0.02em" }}>
          Planifica tu vivac.<br /><span style={{ color: "var(--accent)" }}>Reúne</span> a tu gente.
        </h1>
        <p className="muted" style={{ fontSize: 16, marginTop: 14, maxWidth: 300 }}>
          Crea la excursión, invita a tus amigos y montad juntos el tablero: rutas, listas de equipo y mapas en un mismo sitio.
        </p>

        <div className="stack gap10" style={{ marginTop: 26 }}>
          <button className="btn btn--block btn--lg" style={{ background: "#fff", color: "#1a1a1a", boxShadow: "var(--shadow-sm)" }}>
            <GoogleG size={20} /> Continuar con Google
          </button>
          <button className="btn btn--block btn--ghost btn--lg">
            <Icon name="user" cls="sm" /> Continuar con correo
          </button>
        </div>
        <p className="faint" style={{ fontSize: 12, marginTop: 18, textAlign: "center", lineHeight: 1.5 }}>
          Al continuar aceptas los <u>Términos</u> y la <u>Política de privacidad</u> de YourVivac.
        </p>
      </div>
    </div>
  );
}

/* ---------------- HOME / FEED ---------------- */
function TripCard({ name, place, date, m, dist, members, status, tone = "" }) {
  return (
    <div className="card" style={{ width: 232, flex: "none", overflow: "hidden" }}>
      <div className="imgslot topo" style={{ height: 116, alignItems: "flex-start", justifyContent: "space-between" }}>
        <span className="chip" style={{ margin: 10, background: "color-mix(in srgb,var(--bg) 60%,transparent)", backdropFilter: "blur(3px)" }}>
          <Icon name="calendar" cls="sm" style={{ width: 13, height: 13 }} /> {date}
        </span>
        <span className={`chip ${status === "Confirmada" ? "chip--accent" : "chip--terra"}`} style={{ margin: 10 }}>{status}</span>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <h3 style={{ fontSize: 19 }}>{name}</h3>
        <div className="row gap6 faint" style={{ marginTop: 4, fontSize: 13 }}>
          <Icon name="pin" cls="sm" style={{ width: 13, height: 13 }} /> {place}
        </div>
        <div className="row gap12 mono" style={{ marginTop: 10, fontSize: 12, color: "var(--ink-2)" }}>
          <span className="row gap4"><Icon name="elev" style={{ width: 14, height: 14 }} /> {m} m</span>
          <span className="row gap4"><Icon name="ruler" style={{ width: 14, height: 14 }} /> {dist} km</span>
        </div>
        <div className="spread" style={{ marginTop: 12 }}>
          <div className="row" style={{ paddingLeft: 6 }}>
            {members.map((mm, i) => (
              <Avatar key={i} name={mm.n} tone={mm.t} size={26} ring style={{ marginLeft: -6 }} />
            ))}
            <span className="faint mono" style={{ fontSize: 11, marginLeft: 8 }}>+{Math.max(0, 0)} {members.length} van</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ who, tone, guide, place, name, m, dist, time, kudos, comments, photo }) {
  return (
    <article className="card" style={{ padding: 14, marginBottom: 12 }}>
      <div className="row gap10">
        <Avatar name={who} tone={tone} size={40} />
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row gap6" style={{ flexWrap: "wrap" }}>
            <strong style={{ fontSize: 15 }}>{who}</strong>
            {guide && <span className="chip chip--guide" style={{ fontSize: 9.5, padding: "2px 7px" }}><Icon name="shield" style={{ width: 11, height: 11 }} /> Guía</span>}
          </div>
          <div className="faint" style={{ fontSize: 12.5 }}>completó una salida · {time}</div>
        </div>
        <Icon name="more" cls="sm" style={{ color: "var(--ink-3)" }} />
      </div>

      <h3 style={{ fontSize: 21, marginTop: 12 }}>{name}</h3>
      <div className="row gap6 faint" style={{ fontSize: 13, marginTop: 3 }}>
        <Icon name="pin" cls="sm" style={{ width: 13, height: 13 }} /> {place}
      </div>

      {photo && (
        <div className="imgslot topo" style={{ height: 150, borderRadius: 12, marginTop: 12, alignItems: "flex-end" }}>
          <span className="imgslot__tag">foto · {photo}</span>
        </div>
      )}

      <div className="row gap16 mono" style={{ marginTop: 12, fontSize: 13 }}>
        <span><span className="faint">Desnivel</span><br /><span style={{ fontSize: 16, color: "var(--ink)" }}>{m} m</span></span>
        <span><span className="faint">Distancia</span><br /><span style={{ fontSize: 16, color: "var(--ink)" }}>{dist} km</span></span>
        <span><span className="faint">Vivacs</span><br /><span style={{ fontSize: 16, color: "var(--accent)" }}>+1</span></span>
      </div>

      <hr className="hr" style={{ margin: "13px 0 11px" }} />
      <div className="row gap20 faint" style={{ fontSize: 13.5 }}>
        <span className="row gap6"><Icon name="heart" cls="sm" /> {kudos}</span>
        <span className="row gap6"><Icon name="chat" cls="sm" /> {comments}</span>
        <span className="row gap6" style={{ marginLeft: "auto" }}><Icon name="share" cls="sm" /></span>
      </div>
    </article>
  );
}

function HomeScreen() {
  return (
    <div className="screen">
      <header className="spread" style={{ padding: "6px 18px 12px", flex: "none" }}>
        <Logo size={19} />
        <div className="row gap14">
          <Icon name="search" />
          <div style={{ position: "relative" }}>
            <Icon name="bell" />
            <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: 4, background: "var(--terra)" }} />
          </div>
        </div>
      </header>

      <div className="screen__scroll">
        <div style={{ padding: "0 18px" }}>
          <h1 style={{ fontSize: 27, letterSpacing: "-0.01em" }}>Hola, Marcos</h1>
          <p className="muted" style={{ fontSize: 14.5, marginTop: 3 }}>Tienes <span className="accent">2 salidas</span> en preparación.</p>
        </div>

        {/* tus salidas — carrusel */}
        <div className="spread" style={{ padding: "20px 18px 10px" }}>
          <h3 style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>Tus salidas</h3>
          <span className="faint row gap4" style={{ fontSize: 13 }}>Ver todas <Icon name="chevron" cls="sm" style={{ width: 13, height: 13 }} /></span>
        </div>
        <div className="row gap12" style={{ padding: "0 18px 4px", overflow: "hidden" }}>
          <TripCard name="Vivac en el Aneto" place="Benasque, Huesca" date="14 JUN" m="1.180" dist="22" status="Confirmada"
            members={[{ n: "Marcos", t: "" }, { n: "Lucía R", t: "t" }, { n: "Iker", t: "s" }, { n: "Ana", t: "" }]} />
          <TripCard name="Travesía GR-11" place="Pirineo navarro" date="2 JUL" m="2.400" dist="48" status="Planeando"
            members={[{ n: "Marcos", t: "" }, { n: "Bea", t: "t" }]} />
        </div>

        {/* actividad de tu gente */}
        <div className="spread" style={{ padding: "22px 18px 10px" }}>
          <h3 style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>De tu cordada</h3>
          <span className="chip"><Icon name="filter" style={{ width: 12, height: 12 }} /> Todos</span>
        </div>
        <div style={{ padding: "0 18px 18px" }}>
          <FeedCard who="Lucía Roldán" tone="t" guide place="Pico Aneto · 3.404 m" name="Amanecer en el Aneto" m="1.420" dist="24" time="hace 2 días" kudos="34" comments="6" photo="cima del aneto" />
          <FeedCard who="Iker Mendi" tone="s" place="Circo de Gredos" name="Vivac en la Laguna Grande" m="980" dist="17" time="hace 5 días" kudos="21" comments="3" photo="laguna al alba" />
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

/* ---------------- CREAR EXCURSIÓN + INVITAR ---------------- */
function Field({ label, children, hint }) {
  return (
    <label className="stack gap6" style={{ marginBottom: 16 }}>
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span className="faint" style={{ fontSize: 12 }}>{hint}</span>}
    </label>
  );
}
function Input({ value, placeholder, icon, mono }) {
  return (
    <div className="row gap10" style={{ background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--line)", borderRadius: 12, padding: "12px 14px" }}>
      {icon && <Icon name={icon} cls="sm" style={{ color: "var(--ink-3)" }} />}
      <span className={mono ? "mono" : ""} style={{ fontSize: 15.5, color: value ? "var(--ink)" : "var(--ink-3)" }}>{value || placeholder}</span>
    </div>
  );
}

function CreateScreen() {
  const friends = [
    { n: "Lucía R", t: "t", on: true }, { n: "Iker M", t: "s", on: true },
    { n: "Ana P", t: "", on: false }, { n: "Bea L", t: "t", on: false },
    { n: "Diego", t: "s", on: false }, { n: "Sara V", t: "", on: false },
  ];
  return (
    <div className="screen">
      <AppBar title="Nueva salida" sub="Paso 1 de 2 · Detalles" right={<span className="faint mono" style={{ fontSize: 13 }}>Cancelar</span>} />
      <div className="screen__scroll" style={{ padding: "4px 18px 16px" }}>
        {/* portada */}
        <div className="imgslot topo" style={{ height: 132, borderRadius: 16, marginBottom: 18, alignItems: "center", justifyContent: "center" }}>
          <div className="stack gap6" style={{ alignItems: "center", margin: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "color-mix(in srgb,var(--bg) 65%,transparent)", display: "grid", placeItems: "center", backdropFilter: "blur(3px)" }}>
              <Icon name="camera" />
            </div>
            <span className="mono faint" style={{ fontSize: 11 }}>Añade portada o mapa</span>
          </div>
        </div>

        <Field label="Nombre de la salida"><Input value="Vivac en el Aneto" /></Field>

        <div className="row gap12">
          <div className="grow"><Field label="Salida"><Input value="14 jun, 06:00" icon="calendar" mono /></Field></div>
          <div className="grow"><Field label="Regreso"><Input value="15 jun, 18:00" icon="calendar" mono /></Field></div>
        </div>

        <Field label="Lugar / punto de inicio">
          <Input value="Refugio de la Renclusa, Benasque" icon="pin" />
        </Field>

        <Field label="Dificultad">
          <div className="row gap8 wrap">
            <span className="chip">Fácil</span>
            <span className="chip chip--accent">Moderada</span>
            <span className="chip">Difícil</span>
            <span className="chip">Alpina</span>
          </div>
        </Field>

        {/* invitar */}
        <div className="spread" style={{ marginTop: 6, marginBottom: 10 }}>
          <span className="eyebrow">Invita a tu gente</span>
          <span className="accent mono" style={{ fontSize: 12 }}>2 seleccionados</span>
        </div>
        <div className="row gap10" style={{ background: "var(--bg-2)", boxShadow: "inset 0 0 0 1px var(--line)", borderRadius: 12, padding: "11px 14px", marginBottom: 12 }}>
          <Icon name="search" cls="sm" style={{ color: "var(--ink-3)" }} />
          <span className="faint" style={{ fontSize: 15 }}>Busca amigos o pega un enlace…</span>
        </div>

        <div className="stack">
          {friends.map((f, i) => (
            <div key={i} className="row gap12" style={{ padding: "9px 0", borderBottom: i < friends.length - 1 ? "1px solid var(--line)" : "none" }}>
              <Avatar name={f.n} tone={f.t} size={38} />
              <div className="grow">
                <div style={{ fontSize: 15 }}>{f.n}</div>
                <div className="faint mono" style={{ fontSize: 11 }}>{f.on ? "se apunta" : "@" + f.n.toLowerCase().replace(/ /g, "")}</div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
                background: f.on ? "var(--accent)" : "transparent", color: f.on ? "var(--accent-ink)" : "var(--ink-3)",
                boxShadow: f.on ? "none" : "inset 0 0 0 1.5px var(--line-2)" }}>
                <Icon name={f.on ? "check" : "plus"} cls="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA fija */}
      <div style={{ padding: "12px 18px", background: "var(--bg-2)", boxShadow: "inset 0 1px 0 var(--line)", flex: "none" }}>
        <button className="btn btn--block btn--lg">Continuar al tablero <Icon name="arrow" cls="sm" /></button>
      </div>
    </div>
  );
}

/* ---------------- PERFIL ---------------- */
function Stat({ n, label, tone }) {
  return (
    <div className="stack" style={{ alignItems: "center", flex: 1 }}>
      <span className="mono" style={{ fontSize: 23, color: tone || "var(--ink)", lineHeight: 1 }}>{n}</span>
      <span className="eyebrow" style={{ marginTop: 5, fontSize: 10 }}>{label}</span>
    </div>
  );
}

function ProfileScreen({ guide = false }) {
  const trips = [
    { n: "Aneto · 3.404 m", d: "JUN 25", m: "1.420" },
    { n: "Posets", d: "ABR 25", m: "1.310" },
    { n: "Gredos", d: "FEB 25", m: "980" },
    { n: "Ordesa", d: "OCT 24", m: "1.150" },
  ];
  return (
    <div className="screen">
      <header className="spread" style={{ padding: "6px 18px 4px", flex: "none" }}>
        <Icon name="back" cls="lg" />
        <div className="row gap16"><Icon name="share" /><Icon name="settings" /></div>
      </header>

      <div className="screen__scroll">
        <div style={{ padding: "8px 18px 0", position: "relative" }}>
          <div className="topo-bg" style={{ height: 120, bottom: "auto", opacity: .6 }} />
          <div className="row gap14" style={{ position: "relative" }}>
            <Avatar name="Marcos Vidal" size={76} style={{ fontSize: 27 }} ring />
            <div className="grow" style={{ paddingTop: 4 }}>
              <div className="row gap8" style={{ flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 24 }}>Marcos Vidal</h2>
                {guide && <span className="chip chip--guide"><Icon name="shield" style={{ width: 12, height: 12 }} /> Guía certificado</span>}
              </div>
              <div className="faint row gap6 mono" style={{ fontSize: 12.5, marginTop: 4 }}>
                <Icon name="pin" style={{ width: 13, height: 13 }} /> Jaca, Huesca · desde 2023
              </div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 14.5, marginTop: 12 }}>
            {guide
              ? "Técnico deportivo en media montaña. Ayudo a planificar travesías seguras por el Pirineo aragonés."
              : "Fin de semana = mochila y botas. Coleccionando tresmiles del Pirineo, uno a uno."}
          </p>
          <div className="row gap8" style={{ marginTop: 12 }}>
            <button className="btn" style={{ flex: 1 }}>Seguir</button>
            <button className="btn btn--ghost" style={{ flex: 1 }}>Mensaje</button>
            {guide && <button className="btn btn--terra none" style={{ padding: "11px 14px" }}>Pedir ayuda</button>}
          </div>
        </div>

        {/* contadores */}
        <div className="card" style={{ margin: "18px 18px 0", padding: "16px 8px" }}>
          <div className="row">
            <Stat n="38" label="Salidas" />
            <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch" }} />
            <Stat n="14" label="Vivacs" tone="var(--accent)" />
            <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch" }} />
            <Stat n="612" label="km" />
            <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch" }} />
            <Stat n="9.2k" label="Desnivel+" tone="var(--terra)" />
          </div>
        </div>

        {/* logros */}
        <div className="row gap10" style={{ padding: "16px 18px 4px", overflow: "hidden" }}>
          {[["trophy", "10 tresmiles", "var(--terra)"], ["flag", "GR-11", "var(--accent)"], ["star", "Madrugador", "var(--sky)"], ["mountain", "Aneto x3", "var(--ink-2)"]].map(([ic, t, c], i) => (
            <div key={i} className="card stack gap8" style={{ alignItems: "center", padding: "12px 10px", minWidth: 78, flex: "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", color: c, boxShadow: `inset 0 0 0 1px color-mix(in srgb,${c} 40%,transparent)` }}><Icon name={ic} /></div>
              <span className="mono" style={{ fontSize: 10, textAlign: "center", color: "var(--ink-2)" }}>{t}</span>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="row gap20" style={{ padding: "16px 18px 0", borderBottom: "1px solid var(--line)" }}>
          <span style={{ fontSize: 14.5, paddingBottom: 10, borderBottom: "2px solid var(--accent)", color: "var(--ink)" }}>Salidas</span>
          <span className="faint" style={{ fontSize: 14.5, paddingBottom: 10 }}>Consejos</span>
          <span className="faint" style={{ fontSize: 14.5, paddingBottom: 10 }}>Mapa</span>
        </div>
        <div style={{ padding: "14px 18px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {trips.map((t, i) => (
            <div key={i} className="card" style={{ overflow: "hidden" }}>
              <div className="imgslot topo" style={{ height: 84, alignItems: "flex-start" }}>
                <span className="chip mono" style={{ margin: 8, fontSize: 9.5, padding: "2px 7px", background: "color-mix(in srgb,var(--bg) 60%,transparent)" }}>{t.d}</span>
              </div>
              <div style={{ padding: "9px 11px 11px" }}>
                <div style={{ fontSize: 14.5, fontFamily: "var(--font-display)" }}>{t.n}</div>
                <div className="faint mono row gap4" style={{ fontSize: 11, marginTop: 4 }}><Icon name="elev" style={{ width: 12, height: 12 }} /> {t.m} m+</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="me" />
    </div>
  );
}

Object.assign(window, { LoginScreen, HomeScreen, CreateScreen, ProfileScreen });
