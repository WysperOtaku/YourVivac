# BRouter self-host para YourVivac (motor de rutas de senderismo).
# Compila BRouter desde el repo oficial (abrensch/brouter) y arranca su servidor
# HTTP en el puerto 17777, sirviendo segmentos desde /segments y perfiles desde
# /brouter/profiles2 (incluye nuestro yv-hiking.brf).

# --- Etapa de build: JDK + Gradle para compilar el fat-jar del servidor -------
FROM eclipse-temurin:17-jdk AS build

ARG BROUTER_VERSION=1.7.7

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /src
RUN git clone --depth 1 --branch "${BROUTER_VERSION}" https://github.com/abrensch/brouter.git .

# Compila el módulo del servidor (sin tests). Produce brouter-*-all.jar (fat-jar).
RUN ./gradlew --no-daemon clean build -x test

# Normaliza el nombre del fat-jar resultante a /brouter.jar.
RUN cp "$(ls brouter-server/build/libs/brouter-*-all.jar | sort -V | tail -n1)" /brouter.jar

# --- Etapa de runtime: sólo JRE + jar + perfiles ------------------------------
FROM eclipse-temurin:17-jre

LABEL org.opencontainers.image.title="YourVivac BRouter" \
      org.opencontainers.image.description="BRouter self-host (senderismo de montaña) para YourVivac"

# curl para el script de descarga de segmentos.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd -r -u 10001 -m -d /brouter brouter

WORKDIR /brouter

# Jar del servidor.
COPY --from=build /brouter.jar ./brouter.jar
# Perfiles oficiales (incluye lookups.dat, trekking.brf, etc.).
COPY --from=build /src/misc/profiles2/ ./profiles2/
# Nuestro perfil de senderismo de montaña.
COPY yv-hiking.brf ./profiles2/yv-hiking.brf
# Script para poblar los segmentos de Iberia.
COPY fetch-segments.sh /usr/local/bin/fetch-segments.sh

RUN mkdir -p /segments ./customprofiles \
 && chmod +x /usr/local/bin/fetch-segments.sh \
 && chown -R brouter:brouter /brouter /segments

USER brouter
EXPOSE 17777
VOLUME ["/segments"]

# btools.server.RouteServer <segmentdir> <profiledir> <customprofiledir> <port> <maxthreads>
CMD ["sh", "-c", "java -Xmx512M -DmaxRunningTime=300 -DuseRFCMimeType=false -cp /brouter/brouter.jar btools.server.RouteServer /segments /brouter/profiles2 /brouter/customprofiles 17777 1"]
