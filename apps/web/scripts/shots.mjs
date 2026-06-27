// Harness de screenshots de fidelidad. Levanta el navegador, STUBEA la API en el
// navegador (sin backend) y captura cada vista logueada en móvil/escritorio y
// dark/light. Uso:
//   1) pnpm --filter @yourvivac/web build
//   2) pnpm --filter @yourvivac/web preview   (sirve en http://localhost:4173)
//   3) node apps/web/scripts/shots.mjs
// Salida: apps/web/shots/<ruta>-<viewport>-<tema>.png
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.SHOT_BASE || 'http://localhost:4173';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots');
mkdirSync(OUT, { recursive: true });

// ---- Fixtures ------------------------------------------------------------
const members = [
  { id: 'u1', displayName: 'Marcos Vidal', username: 'marcosvidal', role: 'admin' },
  { id: 'u2', displayName: 'Lucía Roldán', username: 'lucia', role: 'guide', guide: { status: 'approved' } },
  { id: 'u3', displayName: 'Iker Mendi', username: 'iker', role: 'user' },
];
const user = {
  id: 'u1', displayName: 'Marcos Vidal', username: 'marcosvidal', email: 'marcos@vivac.app',
  role: 'admin', emailVerified: true, authProviders: [],
  stats: { trips: 38, vivacs: 14, distanceKm: 612, elevationGain: 9200 },
  achievements: [{ key: 'a1', label: '10 tresmiles', earnedAt: '' }, { key: 'a2', label: 'GR-11', earnedAt: '' }],
  settings: { theme: 'dark', density: 'regular', fontPair: 'a', units: 'metric', defaultTripVisibility: 'private', notifications: { push: true, email: false, tripInvites: true, messages: true, mentions: true } },
  counts: { followers: 120, following: 88 }, bio: 'Coleccionando tresmiles del Pirineo, uno a uno.',
  location: { name: 'Jaca, Huesca' }, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
};
const trip = {
  id: 'demo123', title: 'Vivac en el Aneto', slug: 'vivac-aneto',
  description: 'Vivac de dos días al pico más alto del Pirineo. Subida por el glaciar y noche en altura.',
  owner: 'u1',
  members: [{ userId: 'u1', role: 'owner', rsvp: 'going', joinedAt: '' }, { userId: 'u2', role: 'member', rsvp: 'going', joinedAt: '' }, { userId: 'u3', role: 'member', rsvp: 'maybe', joinedAt: '' }],
  memberUsers: members, startDate: '2026-06-14T06:00:00Z', endDate: '2026-06-15T18:00:00Z',
  location: { name: 'Refugio de la Renclusa', coords: { lat: 42.63, lng: 0.65 } },
  difficulty: 'alpina', distanceKm: 22, elevationGain: 1180, visibility: 'public', status: 'confirmed',
  stats: { pinCount: 6, photoCount: 2, kudos: 12, commentCount: 3 }, createdAt: '', updatedAt: '',
};
const trips = [trip, { ...trip, id: 't2', title: 'Travesía GR-11', slug: 'gr11', status: 'planning', difficulty: 'moderada', elevationGain: 2400, distanceKm: 48 }];
const feed = [
  { activityId: 'a1', actor: members[1], type: 'trip_completed', trip: { id: 't2', title: 'Amanecer en el Aneto', slug: 'amanecer' }, createdAt: '2026-06-17T00:00:00Z' },
  { activityId: 'a2', actor: members[2], type: 'tip_published', tip: { id: 'tp1', title: 'Vivac responsable: no dejar rastro', slug: 'lnt' }, createdAt: '2026-06-15T00:00:00Z' },
];
const tips = [
  { id: 'tp1', authorId: 'u2', title: 'Cómo elegir el saco según la cota del vivac', slug: 'saco-cota', excerpt: 'Guía rápida para no pasar frío en altura.', category: 'material', contentMarkdown: '## Saco\nElige según la cota.', readMinutes: 6, tags: [], status: 'published', moderation: { status: 'ok' }, counts: { likes: 218, comments: 12, views: 900 }, createdAt: '', updatedAt: '' },
  { id: 'tp2', authorId: 'u3', title: 'Leer un parte de AEMET de montaña', slug: 'aemet', category: 'meteo', readMinutes: 5, tags: [], status: 'published', moderation: { status: 'ok' }, counts: { likes: 134, comments: 4, views: 400 }, createdAt: '', updatedAt: '' },
];
const pins = [
  { id: 'p1', tripId: 'demo123', authorId: 'u2', type: 'note', layout: { x: 24, y: 20, rotation: -2, z: 1, w: 210 }, note: { markdown: '## Plan de cumbre ⛰️\n- Salida del refu **6:00**\n- Tramo glaciar → crampones' }, reactions: [] },
  { id: 'p2', tripId: 'demo123', authorId: 'u3', type: 'text', layout: { x: 280, y: 40, rotation: 1.5, z: 2, w: 200 }, text: { body: '¿Coche compartido? Salgo de Jaca el viernes a las 16h. Caben 3 🚗', color: '#a8d77c' }, reactions: [{ userId: 'u1', emoji: '❤️' }] },
  { id: 'p3', tripId: 'demo123', authorId: 'u1', type: 'link', layout: { x: 30, y: 300, rotation: 1, z: 3, w: 210 }, link: { url: 'https://alberges.com', title: 'Refugio de la Renclusa', domain: 'alberges.com' }, reactions: [] },
  { id: 'p4', tripId: 'demo123', authorId: 'u2', type: 'map', layout: { x: 300, y: 320, rotation: -1.5, z: 4, w: 210 }, map: { label: 'Pico Aneto', coords: { lat: 42.63, lng: 0.65 } }, reactions: [] },
];
const messages = [
  { id: 'm1', tripId: 'demo123', authorId: 'u2', type: 'text', body: '¿Confirmamos el refugio para el viernes?', readBy: [], createdAt: '2026-06-18T10:00:00Z' },
  { id: 'm2', tripId: 'demo123', authorId: 'u1', type: 'text', body: 'Sí, reservo yo. Somos 3 ✋', readBy: [], createdAt: '2026-06-18T10:05:00Z' },
];
const gear = [{ id: 'g1', ownerId: 'u1', name: 'Vivac de verano', icon: '', items: [{ id: 'i1', name: 'Saco Trangoworld -5 ºC', weightGrams: 1180, checked: true, addedBy: 'u1', product: { storeKey: 'amazon', title: 'Saco', url: '#' } }, { id: 'i2', name: 'Esterilla Forclaz MT500', weightGrams: 480, checked: false, addedBy: 'u1', product: { storeKey: 'decathlon', title: 'Esterilla', url: '#' } }], totalWeight: 1660, isTemplate: false, usedInTrips: [], visibility: 'private', createdAt: '', updatedAt: '' }];
const notifications = { items: [{ id: 'n1', userId: 'u1', type: 'trip_invite', read: false, channels: { push: true, email: false }, createdAt: '2026-06-18T00:00:00Z' }], unread: 1 };
const profile = { user, isFollowing: false };
const metrics = { users: 12480, trips: 3927, tips: 612, pendingGuides: 4, openReports: 2 };
const series = Array.from({ length: 14 }, (_, i) => ({ date: `2026-06-${String(i + 6).padStart(2, '0')}`, value: Math.round(20 + Math.random() * 60) }));
const guideApps = [{ id: 'ga1', userId: { id: 'u2', displayName: 'Lucía Roldán', username: 'lucia' }, certification: 'TD Media Montaña', certBody: 'FEDME', documents: [], status: 'pending', createdAt: '2026-06-18T00:00:00Z' }];
const reports = [{ id: 'r1', reporterId: 'u3', targetType: 'comment', targetId: 'c1', reason: 'Comentario ofensivo', status: 'open', createdAt: '2026-06-17T00:00:00Z' }];

const paginated = (arr) => ({ items: arr, total: arr.length, page: 1, pageSize: 20, hasMore: false });

function resolve(p) {
  if (p === '/auth/me') return user;
  if (p === '/users/search') return members.filter((m) => m.id !== user.id);
  if (p === '/users/suggestions') return members.filter((m) => m.id !== user.id);
  if (p === '/maps/search') return [];
  if (p === '/feed') return paginated(feed);
  if (p === '/trips') return trips;
  if (/^\/trips\/[^/]+\/board$/.test(p)) return pins;
  if (/^\/trips\/[^/]+\/messages$/.test(p)) return paginated(messages);
  if (/^\/trips\/[^/]+$/.test(p)) return trip;
  if (p === '/explore/trips') return paginated(trips);
  if (p === '/tips') return paginated(tips);
  if (/^\/tips\/[^/]+$/.test(p)) return tips[0];
  if (p === '/notifications') return notifications;
  if (p.startsWith('/users/') && p.endsWith('/trips')) return trips;
  if (p.startsWith('/users/') && p.endsWith('/tips')) return tips;
  if (/^\/users\/[^/]+$/.test(p)) return profile;
  if (p === '/gear-lists') return gear;
  if (p === '/guide/application') return null;
  if (p === '/admin/metrics') return metrics;
  if (p === '/admin/metrics/timeseries') return series;
  if (p === '/admin/guide-applications') return guideApps;
  if (p === '/admin/reports') return reports;
  return [];
}

// SHOT_UNAUTH=1 → sesión cerrada (auth/me 401): permite capturar el login real.
const UNAUTH = process.env.SHOT_UNAUTH === '1';
const ROUTES = UNAUTH
  ? [['login', '/login']]
  : [
      ['home', '/'], ['trips', '/salidas'], ['create', '/crear'],
      ['trip-detail', '/salida/demo123'], ['board', '/salida/demo123/tablero'], ['chat', '/salida/demo123/chat'],
      ['explore', '/explorar'], ['gear', '/equipo'], ['tips', '/consejos'],
      ['profile', '/perfil'], ['settings', '/ajustes'], ['admin', '/admin'],
    ];
const VIEWPORTS = [['mobile', 390, 844], ['desktop', 1280, 900]];
const THEMES = ['dark', 'light'];

const browser = await chromium.launch();
const context = await browser.newContext();
// Stub de la API y del socket (sin backend).
await context.route('**/socket.io/**', (r) => r.abort());
await context.route('**/api/v1/**', (route) => {
  const p = new URL(route.request().url()).pathname.replace(/^.*\/api\/v1/, '');
  if (UNAUTH && (p === '/auth/me' || p === '/auth/refresh')) {
    return route.fulfill({ status: 401, contentType: 'application/json', body: '{"message":"no auth"}' });
  }
  const data = resolve(p);
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
});

let n = 0;
for (const [vp, w, h] of VIEWPORTS) {
  const page = await context.newPage();
  await page.setViewportSize({ width: w, height: h });
  for (const [name, path] of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1600); // deja que el bootstrap + queries rendericen
    for (const theme of THEMES) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await page.waitForTimeout(250);
      const file = join(OUT, `${name}-${vp}-${theme}.png`);
      await page.screenshot({ path: file });
      n++;
      console.log(`✓ ${name} · ${vp} · ${theme}`);
    }
  }
  await page.close();
}
await browser.close();
console.log(`\n${n} screenshots en ${OUT}`);
