import type {
  AggregatedProduct,
  CreateGearListRequest,
  GearItemInput,
  GearList,
  ProductSearchResponse,
} from '@yourvivac/types';
import { totalWeight } from '@yourvivac/utils';
import { GearListModel } from '../../models/gearList.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { searchProducts, getProduct } from '../../lib/storeService.js';
import { HttpError } from '../../middleware/error.js';

async function ownedList(listId: string, userId: string) {
  const list = await GearListModel.findById(listId);
  if (!list) throw HttpError.notFound('Lista no encontrada');
  if (String(list.ownerId) !== userId) throw HttpError.forbidden('No eres el dueño de la lista');
  return list;
}

export const gearService = {
  async list(userId: string): Promise<GearList[]> {
    const lists = await GearListModel.find({ ownerId: userId }).sort({ updatedAt: -1 });
    return serializeDocs<GearList>(lists);
  },

  async create(userId: string, input: CreateGearListRequest): Promise<GearList> {
    const list = await GearListModel.create({ ...input, ownerId: userId, items: [], totalWeight: 0 });
    return serializeDoc<GearList>(list);
  },

  async addItem(listId: string, userId: string, item: GearItemInput): Promise<GearList> {
    const list = await ownedList(listId, userId);
    list.items.push({ ...item, checked: false, addedBy: userId as never } as never);
    list.totalWeight = totalWeight(list.items as { weightGrams?: number }[]);
    await list.save();
    return serializeDoc<GearList>(list);
  },

  async updateItem(
    listId: string,
    userId: string,
    itemId: string,
    patch: { name?: string; weightGrams?: number; checked?: boolean },
  ): Promise<GearList> {
    const list = await ownedList(listId, userId);
    const item = list.items.id(itemId);
    if (!item) throw HttpError.notFound('Ítem no encontrado');
    if (patch.name !== undefined) item.name = patch.name;
    if (patch.weightGrams !== undefined) item.weightGrams = patch.weightGrams;
    if (patch.checked !== undefined) item.checked = patch.checked;
    list.totalWeight = totalWeight(list.items as { weightGrams?: number }[]);
    await list.save();
    return serializeDoc<GearList>(list);
  },

  async search(q: string, stores: string[] | undefined, limit: number): Promise<ProductSearchResponse> {
    try {
      return await searchProducts(q, stores, limit);
    } catch {
      throw new HttpError(502, 'El agregador de tiendas no está disponible', 'aggregator_unavailable');
    }
  },

  async product(store: string, externalId: string): Promise<AggregatedProduct> {
    try {
      return await getProduct(store, externalId);
    } catch {
      throw new HttpError(502, 'El agregador de tiendas no está disponible', 'aggregator_unavailable');
    }
  },
};
