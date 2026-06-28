#!/bin/sh
# fetch-segments.sh — Descarga los segmentos .rd5 de BRouter que cubren la
# Península Ibérica (lon -10..+3, lat 35..44) desde brouter.de a /segments.
#
# Uso:
#   ./fetch-segments.sh [DESTINO]            (DESTINO por defecto: /segments)
#   BROUTER_SEGMENTS_URL=... ./fetch-segments.sh
#
# Dentro del contenedor (puebla el volumen yv-brouter-segments):
#   docker compose --profile routing run --rm brouter fetch-segments.sh
set -eu

BASE="${BROUTER_SEGMENTS_URL:-https://brouter.de/brouter/segments4}"
DEST="${1:-/segments}"

mkdir -p "$DEST"

# Tiles de 5°x5°. Iberia: W10/W5/E0 (lon) x N35/N40 (lat).
# OJO: BRouter NO rellena con ceros (es W10_N40, no W010_N40) → con ceros da 404.
SEGMENTS="
W10_N35.rd5
W5_N35.rd5
E0_N35.rd5
W10_N40.rd5
W5_N40.rd5
E0_N40.rd5
"

for seg in $SEGMENTS; do
  if [ -s "$DEST/$seg" ]; then
    echo "= $seg ya presente, omito"
    continue
  fi
  echo "> Descargando $seg ..."
  curl -fSL --retry 3 --retry-delay 2 -o "$DEST/$seg.tmp" "$BASE/$seg"
  mv "$DEST/$seg.tmp" "$DEST/$seg"
done

echo "Hecho. Segmentos en $DEST:"
ls -lh "$DEST"
