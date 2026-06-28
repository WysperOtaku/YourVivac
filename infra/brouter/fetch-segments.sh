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

# Tiles de 5°x5°. Iberia: W010/W005/E000 (lon) x N35/N40 (lat).
SEGMENTS="
W010_N35.rd5
W005_N35.rd5
E000_N35.rd5
W010_N40.rd5
W005_N40.rd5
E000_N40.rd5
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
