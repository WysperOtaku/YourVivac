import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del singleton de almacenamiento y de axios ANTES de importar el servicio.
vi.mock('../../lib/storage/index.js', () => ({
  storage: { get: vi.fn(), put: vi.fn(), exists: vi.fn(), url: vi.fn(), delete: vi.fn() },
}));
vi.mock('axios', () => ({ default: { get: vi.fn() } }));

import axios from 'axios';
import { storage } from '../../lib/storage/index.js';
import { getTile, geocode, buildStyle } from './maps.service.js';

const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };
const mockedStorage = storage as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getTile (caché de teselas)', () => {
  it('MISS: si no hay caché, pide al IGN y guarda con storage.put', async () => {
    mockedStorage.get.mockResolvedValue(null);
    mockedStorage.put.mockResolvedValue(undefined);
    mockedAxios.get.mockResolvedValue({
      data: new Uint8Array([1, 2, 3]).buffer,
      headers: { 'content-type': 'image/jpeg' },
    });

    const res = await getTile('mtn', 12, 2010, 1530);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const url = mockedAxios.get.mock.calls[0][0] as string;
    expect(url).toContain('mapa-raster');
    expect(url).toContain('layer=MTN');
    expect(url).toContain('TileMatrix=12');
    expect(url).toContain('TileRow=1530');
    expect(url).toContain('TileCol=2010');
    expect(mockedStorage.put).toHaveBeenCalledWith(
      'mtn/12/2010/1530.jpg',
      expect.any(Buffer),
      'image/jpeg',
    );
    expect(res.contentType).toBe('image/jpeg');
    expect(res.body.length).toBe(3);
  });

  it('HIT: si hay caché, la devuelve sin llamar a axios ni put', async () => {
    mockedStorage.get.mockResolvedValue({ body: Buffer.from([9, 9]), contentType: 'image/jpeg' });

    const res = await getTile('relieve', 10, 500, 400);

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedStorage.put).not.toHaveBeenCalled();
    expect(res.body.length).toBe(2);
  });

  it('usa la base dedicada del MDT para la capa relieve', async () => {
    mockedStorage.get.mockResolvedValue(null);
    mockedStorage.put.mockResolvedValue(undefined);
    mockedAxios.get.mockResolvedValue({
      data: new Uint8Array([1]).buffer,
      headers: { 'content-type': 'image/jpeg' },
    });

    await getTile('relieve', 8, 100, 100);
    const url = mockedAxios.get.mock.calls[0][0] as string;
    expect(url).toContain('servicios.idee.es/wmts/mdt');
    expect(url).toContain('layer=Relieve');
  });
});

describe('geocode (parseo de topónimos)', () => {
  it('parsea candidatos de CartoCiudad y descarta coords 0,0', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { address: 'Pico del Teide', lat: 28.272, lng: -16.642, muni: 'La Orotava', province: 'Santa Cruz de Tenerife' },
        { address: 'Calle sin coords', lat: 0, lng: 0, muni: 'X' },
      ],
    });

    const res = await geocode('Teide');

    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      name: 'Pico del Teide',
      coords: { lat: 28.272, lng: -16.642 },
      context: 'La Orotava, Santa Cruz de Tenerife',
    });
  });

  it('recurre a Nominatim si CartoCiudad no devuelve resultados válidos', async () => {
    // 1ª llamada (CartoCiudad) → vacía; 2ª (Nominatim) → resultado.
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [{ lat: '40.4168', lon: '-3.7038', display_name: 'Madrid, España' }],
      });

    const res = await geocode('Madrid');

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(res[0]).toEqual({
      name: 'Madrid',
      coords: { lat: 40.4168, lng: -3.7038 },
      context: 'España',
    });
  });
});

describe('buildStyle', () => {
  it('genera un style MapLibre válido con source hacia nuestro proxy', () => {
    const style = buildStyle('yv-topo', 'http://localhost:4000') as {
      version: number;
      sources: Record<string, { tiles: string[] }>;
      layers: { id: string; type: string }[];
    };
    expect(style.version).toBe(8);
    expect(style.sources.mtn.tiles[0]).toBe(
      'http://localhost:4000/api/v1/maps/tiles/mtn/{z}/{x}/{y}',
    );
    expect(style.layers.some((l) => l.type === 'raster' && l.id === 'mtn')).toBe(true);
  });
});
