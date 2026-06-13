/* ============================================================
   YourVivac — Composición del lienzo + Tweaks
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "type": "a",
  "density": "regular",
  "board": "free"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // teléfono temado por los tweaks
  const P = ({ children, h = 844, theme }) => (
    <Phone theme={theme || t.theme} type={t.type} density={t.density}>{children}</Phone>
  );

  return (
    <React.Fragment>
      <DesignCanvas>

        <DCSection id="acceso" title="Acceso" subtitle="Login con Google · oscuro y claro">
          <DCArtboard id="login-dark" label="Login · oscuro" width={390} height={844}>
            <P><LoginScreen /></P>
          </DCArtboard>
          <DCArtboard id="login-light" label="Login · claro" width={390} height={844}>
            <P theme="light"><LoginScreen /></P>
          </DCArtboard>
        </DCSection>

        <DCSection id="inicio" title="Inicio" subtitle="Feed: quién ha salido y cuántas veces">
          <DCArtboard id="home-m" label="Inicio · móvil" width={390} height={1400}>
            <P h={1400}><HomeScreen /></P>
          </DCArtboard>
          <DCArtboard id="home-d" label="Inicio · escritorio" width={1440} height={900}>
            <DeskHome theme={t.theme} type={t.type} density={t.density} />
          </DCArtboard>
        </DCSection>

        <DCSection id="crear" title="Crear salida" subtitle="Detalles + invitar amigos">
          <DCArtboard id="crear-m" label="Nueva salida" width={390} height={1112}>
            <P h={1112}><CreateScreen /></P>
          </DCArtboard>
        </DCSection>

        <DCSection id="tablero" title="Tablero — variaciones de pines" subtitle="Mural libre · muro ordenado · feed guiado">
          <DCArtboard id="board-free" label="A · Mural corcho" width={390} height={860}>
            <P h={860}><BoardFree /></P>
          </DCArtboard>
          <DCArtboard id="board-wall" label="B · Muro ordenado" width={390} height={860}>
            <P h={860}><BoardWall /></P>
          </DCArtboard>
          <DCArtboard id="board-guided" label="C · Feed guiado" width={390} height={940}>
            <P h={940}><BoardGuided /></P>
          </DCArtboard>
          <DCArtboard id="board-d" label="Tablero · escritorio (sigue el tweak)" width={1440} height={900}>
            <DeskBoard boardStyle={t.board} theme={t.theme} type={t.type} density={t.density} />
          </DCArtboard>
        </DCSection>

        <DCSection id="pines" title="Pines en detalle" subtitle="Lista con tiendas · nota Markdown · mapa · chat">
          <DCArtboard id="pin-list" label="Pin · Lista de equipo" width={390} height={956}>
            <P h={956}><GearListScreen /></P>
          </DCArtboard>
          <DCArtboard id="pin-note" label="Pin · Nota Markdown" width={390} height={860}>
            <P h={860}><NoteScreen /></P>
          </DCArtboard>
          <DCArtboard id="pin-map" label="Pin · Mapa / ubicación" width={390} height={844}>
            <P><MapScreen /></P>
          </DCArtboard>
          <DCArtboard id="pin-chat" label="Chat del grupo" width={390} height={844}>
            <P><ChatScreen /></P>
          </DCArtboard>
        </DCSection>

        <DCSection id="perfil" title="Perfil" subtitle="Salidas realizadas, contadores y rol de guía">
          <DCArtboard id="perfil-user" label="Perfil · montañero" width={390} height={1100}>
            <P h={1100}><ProfileScreen /></P>
          </DCArtboard>
          <DCArtboard id="perfil-guide" label="Perfil · guía certificado" width={390} height={1100}>
            <P h={1100}><ProfileScreen guide /></P>
          </DCArtboard>
        </DCSection>

        <DCSection id="descubrir" title="Descubrir" subtitle="Explorar · Mi equipo · Consejos">
          <DCArtboard id="explorar" label="Explorar · salidas y consejos públicos" width={390} height={1000}>
            <P h={1000}><ExploreScreen /></P>
          </DCArtboard>
          <DCArtboard id="equipo" label="Mi equipo · biblioteca de listas" width={390} height={1060}>
            <P h={1060}><TeamScreen /></P>
          </DCArtboard>
          <DCArtboard id="consejos" label="Consejos · feed de artículos" width={390} height={1240}>
            <P h={1240}><TipsScreen /></P>
          </DCArtboard>
          <DCArtboard id="publicar" label="Modal · publicar consejo" width={390} height={844}>
            <P><PublishTipModal /></P>
          </DCArtboard>
        </DCSection>

        <DCSection id="sistema" title="Cuenta y administración" subtitle="Ajustes · panel de admin">
          <DCArtboard id="ajustes" label="Ajustes" width={390} height={1080}>
            <P h={1080}><SettingsScreen /></P>
          </DCArtboard>
          <DCArtboard id="admin" label="Panel de administración · escritorio" width={1440} height={900}>
            <AdminPanel theme={t.theme} type={t.type} density={t.density} />
          </DCArtboard>
        </DCSection>

      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakRadio label="Modo" value={t.theme} options={["dark", "light"]} onChange={(v) => setTweak("theme", v)} />
        <TweakSection label="Tipografía" />
        <TweakRadio label="Pareja" value={t.type} options={["a", "b", "c"]} onChange={(v) => setTweak("type", v)} />
        <div style={{ fontSize: 11, opacity: .6, margin: "-2px 2px 4px", lineHeight: 1.4 }}>
          a · Young Serif + Newsreader · b · Newsreader · c · DM Serif Display
        </div>
        <TweakSection label="Densidad" />
        <TweakRadio label="Espaciado" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Estilo de tablero" />
        <TweakRadio label="Desktop" value={t.board} options={["free", "wall", "guided"]} onChange={(v) => setTweak("board", v)} />
        <div style={{ fontSize: 11, opacity: .6, margin: "-2px 2px 4px", lineHeight: 1.4 }}>
          Cambia el tablero de escritorio: mural libre · muro ordenado · feed guiado.
        </div>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
