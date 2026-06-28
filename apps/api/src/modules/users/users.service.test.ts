import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks de los modelos: no se necesita Mongo para probar la lógica de sugerencias.
vi.mock('../../models/user.model.js', () => ({ UserModel: { find: vi.fn() } }));
vi.mock('../../models/social.model.js', () => ({ FollowModel: { find: vi.fn() } }));
vi.mock('../../models/trip.model.js', () => ({ TripModel: { find: vi.fn() } }));

import { usersService } from './users.service.js';
import { UserModel } from '../../models/user.model.js';
import { FollowModel } from '../../models/social.model.js';
import { TripModel } from '../../models/trip.model.js';

// Helper: simula la cadena `find(...).sort(...).limit(...)` resolviendo a `rows`.
const chain = (rows: unknown[]) => ({ sort: () => ({ limit: () => rows }) });

describe('usersService.suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excluye al propio usuario y mapea a la forma UserSuggestion', async () => {
    const me = 'me';
    // Sigue a sí mismo (debe filtrarse) y a u1/u2.
    vi.mocked(FollowModel.find).mockReturnValue(
      chain([{ followingId: me }, { followingId: 'u1' }, { followingId: 'u2' }]) as never,
    );
    vi.mocked(TripModel.find).mockReturnValue(chain([]) as never);
    vi.mocked(UserModel.find).mockResolvedValue([
      { _id: 'u1', displayName: 'Ana', username: 'ana', avatar: { url: 'a.png', publicId: 'pa' }, role: 'user' },
      { _id: 'u2', displayName: 'Bob', username: 'bob', role: 'guide' },
    ] as never);

    const result = await usersService.suggestions(me);

    // No se incluye al propio usuario.
    expect(result.map((u) => u.id)).toEqual(['u1', 'u2']);
    expect(result.find((u) => u.id === me)).toBeUndefined();

    // Forma UserSuggestion (= UserSearchResult).
    expect(result[0]).toEqual({
      id: 'u1',
      displayName: 'Ana',
      username: 'ana',
      avatar: { url: 'a.png', publicId: 'pa' },
      role: 'user',
    });
    expect(result[1]).toEqual({
      id: 'u2',
      displayName: 'Bob',
      username: 'bob',
      avatar: undefined,
      role: 'guide',
    });

    // La consulta final no debe pedir al propio usuario.
    const findArg = (vi.mocked(UserModel.find).mock.calls[0] as unknown[])[0] as { _id: { $in: string[] } };
    expect(findArg._id.$in).not.toContain(me);
  });

  it('completa con co-miembros recientes cuando hay pocos follows', async () => {
    const me = 'me';
    vi.mocked(FollowModel.find).mockReturnValue(chain([{ followingId: 'u1' }]) as never);
    // Salida con el propio usuario (se filtra) y un co-miembro u3.
    vi.mocked(TripModel.find).mockReturnValue(
      chain([{ owner: me, members: [{ userId: me }, { userId: 'u3' }] }]) as never,
    );
    vi.mocked(UserModel.find).mockResolvedValue([
      { _id: 'u1', displayName: 'Ana', username: 'ana', role: 'user' },
      { _id: 'u3', displayName: 'Cid', username: 'cid', role: 'user' },
    ] as never);

    const result = await usersService.suggestions(me);

    expect(vi.mocked(TripModel.find)).toHaveBeenCalled();
    expect(result.map((u) => u.id)).toEqual(['u1', 'u3']);
  });
});
