# BRouter self-host — Motor de rutas de senderismo

Servicio que calcula rutas de senderismo de montaña sobre datos de OpenStreetMap.
La API de YourVivac (`POST /api/v1/routing`) hace de proxy a este servicio y
normaliza su respuesta GeoJSON a `RouteResult` (geometría + distancia + desnivel ±).

Se compila desde el repo oficial [`abrensch/brouter`](https://github.com/abrensch/brouter)
y arranca `btools.server.RouteServer` en el puerto **17777**.

## Contenido

- `Dockerfile` — build multi-stage (compila el fat-jar de BRouter, runtime con JRE).
- `yv-hiking.brf` — perfil de senderismo de montaña de YourVivac (favorece sendas,
  penaliza el asfalto, consciente del desnivel, admite hasta `demanding_mountain_hiking`).
- `fetch-segments.sh` — descarga los segmentos `.rd5` de Iberia.

## Arrancar el servicio

Definido en `docker-compose.yml` bajo el perfil `routing` (no arranca por defecto):

```bash
docker compose --profile routing up brouter
```

El primer build compila BRouter con Gradle (tarda unos minutos). La variable
`BROUTER_URL` (por defecto `http://brouter:17777` en compose) ya apunta aquí.

## Poblar los segmentos (datos de rutas)

BRouter necesita los segmentos `.rd5` del área. Sin ellos, devuelve error de
"posición no mapeada". `fetch-segments.sh` descarga los 6 tiles que cubren la
Península Ibérica (lon −10..+3, lat 35..44):
`W010_N35`, `W005_N35`, `E000_N35`, `W010_N40`, `W005_N40`, `E000_N40`
(son varios cientos de MB en total).

Dentro del contenedor (puebla el volumen `yv-brouter-segments`):

```bash
docker compose --profile routing run --rm brouter fetch-segments.sh
```

Y después arranca el servicio normalmente. Para otras zonas, descarga los tiles
correspondientes desde <https://brouter.de/brouter/segments4/> (rejilla de 5°×5°)
o ajusta `BROUTER_SEGMENTS_URL`.

## Probar manualmente

Una vez con segmentos cargados (formato BRouter: `lon,lat`):

```bash
curl "http://localhost:17777/brouter?lonlats=-3.7038,40.4168|-3.68,40.44&profile=yv-hiking&alternativeidx=0&format=geojson"
```

## Perfiles disponibles

- `yv-hiking` — senderismo de montaña de YourVivac (usado por los perfiles
  `hiking` y `mountain` de la API).
- `trekking` — perfil oficial de BRouter (usado por el perfil `trekking` de la API).

El resto de perfiles oficiales de BRouter quedan disponibles en `profiles2/`.
