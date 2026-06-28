import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { routingService } from './routing.service.js';
import { HttpError } from '../../middleware/error.js';

// Mockeamos axios para no llamar al BRouter real (el E2E pesado lo valida el coordinador).
vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

/** Respuesta GeoJSON mínima al estilo BRouter (properties son strings). */
function geojsonFixture() {
  return {
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            'track-length': '1500',
            'filtered ascend': '120',
            'total-time': '1800',
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-3.7038, 40.4168, 600],
              [-3.7, 40.42, 660], // +60 de subida
              [-3.69, 40.43, 610], // -50 de bajada
              [-3.68, 40.44, 640], // +30 de subida
            ],
          },
        },
      ],
    },
  };
}

describe('routingService.route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('construye la query lonlats (lng,lat) y el profile BRouter correctos', async () => {
    mockedGet.mockResolvedValue(geojsonFixture());

    await routingService.route({
      profile: 'hiking',
      waypoints: [
        { lat: 40.4168, lng: -3.7038 },
        { lat: 40.44, lng: -3.68 },
      ],
    });

    expect(mockedGet).toHaveBeenCalledTimes(1);
    const [url, config] = mockedGet.mock.calls[0];
    expect(url).toContain('/brouter');
    // OJO: lng primero, lat después; waypoints separados por '|'.
    expect(config?.params.lonlats).toBe('-3.7038,40.4168|-3.68,40.44');
    expect(config?.params.profile).toBe('yv-hiking');
    expect(config?.params.format).toBe('geojson');
    expect(config?.params.alternativeidx).toBe(0);
  });

  it('mapea trekking → perfil BRouter "trekking" y mountain → "yv-hiking"', async () => {
    mockedGet.mockResolvedValue(geojsonFixture());

    await routingService.route({
      profile: 'trekking',
      waypoints: [
        { lat: 40, lng: -3 },
        { lat: 41, lng: -3 },
      ],
    });
    expect(mockedGet.mock.calls[0][1]?.params.profile).toBe('trekking');

    await routingService.route({
      profile: 'mountain',
      waypoints: [
        { lat: 40, lng: -3 },
        { lat: 41, lng: -3 },
      ],
    });
    expect(mockedGet.mock.calls[1][1]?.params.profile).toBe('yv-hiking');
  });

  it('parsea el GeoJSON a RouteResult (distancia, desnivel ±, duración, geometría)', async () => {
    mockedGet.mockResolvedValue(geojsonFixture());

    const result = await routingService.route({
      profile: 'hiking',
      waypoints: [
        { lat: 40.4168, lng: -3.7038 },
        { lat: 40.44, lng: -3.68 },
      ],
    });

    expect(result.distanceM).toBe(1500);
    expect(result.ascentM).toBe(120); // de "filtered ascend"
    expect(result.descentM).toBe(50); // único descenso 660→610
    expect(result.durationMin).toBe(30); // 1800s / 60
    expect(result.geometry).toHaveLength(4);
    // Geometría normalizada a {lat,lng} desde [lng,lat,alt].
    expect(result.geometry[0]).toEqual({ lat: 40.4168, lng: -3.7038 });
    expect(result.profile).toBe('hiking');
  });

  it('lanza 502 si BRouter no responde (error de red)', async () => {
    mockedGet.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(
      routingService.route({
        profile: 'hiking',
        waypoints: [
          { lat: 40, lng: -3 },
          { lat: 41, lng: -3 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 502 });
  });

  it('lanza 422 si BRouter devuelve texto de error (sin ruta)', async () => {
    mockedGet.mockResolvedValue({ data: 'position not mapped in existing datafile' });

    await expect(
      routingService.route({
        profile: 'hiking',
        waypoints: [
          { lat: 40, lng: -3 },
          { lat: 41, lng: -3 },
        ],
      }),
    ).rejects.toBeInstanceOf(HttpError);
    await expect(
      routingService.route({
        profile: 'hiking',
        waypoints: [
          { lat: 40, lng: -3 },
          { lat: 41, lng: -3 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it('lanza 422 si el GeoJSON no trae geometría suficiente', async () => {
    mockedGet.mockResolvedValue({ data: { features: [{ geometry: { coordinates: [] } }] } });

    await expect(
      routingService.route({
        profile: 'hiking',
        waypoints: [
          { lat: 40, lng: -3 },
          { lat: 41, lng: -3 },
        ],
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});
