# BRouter self-host para YourVivac (motor de rutas de senderismo).
# Usa la DISTRIBUCIÓN OFICIAL prebuilt (release .zip) en vez de compilar con
# Gradle: build en segundos y sin riesgo de fallo de compilación. Arranca
# btools.server.RouteServer en el puerto 17777, sirviendo segmentos desde
# /segments y perfiles desde /brouter/profiles2 (incluye nuestro yv-hiking.brf).

FROM eclipse-temurin:17-jre

# OJO: el tag del repo es vX.Y.Z (con 'v'); el zip se llama brouter-X.Y.Z.zip.
ARG BROUTER_VERSION=1.7.9

LABEL org.opencontainers.image.title="YourVivac BRouter" \
      org.opencontainers.image.description="BRouter self-host (senderismo de montaña) para YourVivac"

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates unzip \
 && rm -rf /var/lib/apt/lists/* \
 && useradd -r -u 10001 -m -d /brouter brouter

WORKDIR /brouter

# Descarga la distribución oficial y extrae el fat-jar del servidor + los perfiles
# oficiales (incluye lookups.dat, trekking.brf, hiking-mountain.brf, etc.).
RUN curl -fsSL -o /tmp/brouter.zip \
      "https://github.com/abrensch/brouter/releases/download/v${BROUTER_VERSION}/brouter-${BROUTER_VERSION}.zip" \
 && unzip -q /tmp/brouter.zip -d /tmp/brouter \
 && cp "/tmp/brouter/brouter-${BROUTER_VERSION}/brouter-${BROUTER_VERSION}-all.jar" /brouter/brouter.jar \
 && cp -r "/tmp/brouter/brouter-${BROUTER_VERSION}/profiles2" /brouter/profiles2 \
 && rm -rf /tmp/brouter /tmp/brouter.zip

# Nuestro perfil de senderismo de montaña.
COPY yv-hiking.brf /brouter/profiles2/yv-hiking.brf
# Script para poblar los segmentos de Iberia.
COPY fetch-segments.sh /usr/local/bin/fetch-segments.sh

RUN mkdir -p /segments /brouter/customprofiles \
 && chmod +x /usr/local/bin/fetch-segments.sh \
 && chown -R brouter:brouter /brouter /segments

USER brouter
EXPOSE 17777
VOLUME ["/segments"]

# btools.server.RouteServer <segmentdir> <profiledir> <customprofiledir> <port> <maxthreads>
CMD ["sh", "-c", "java -Xmx512M -DmaxRunningTime=300 -DuseRFCMimeType=false -cp /brouter/brouter.jar btools.server.RouteServer /segments /brouter/profiles2 /brouter/customprofiles 17777 1"]
