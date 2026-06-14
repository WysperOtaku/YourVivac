import { asyncHandler } from '../../middleware/error.js';
import { gearService } from './gear.service.js';

export const gearController = {
  list: asyncHandler(async (req, res) => {
    res.json(await gearService.list(req.user!.userId));
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json(await gearService.create(req.user!.userId, req.body));
  }),
  addItem: asyncHandler(async (req, res) => {
    res.status(201).json(await gearService.addItem(req.params.id, req.user!.userId, req.body));
  }),
  updateItem: asyncHandler(async (req, res) => {
    res.json(await gearService.updateItem(req.params.id, req.user!.userId, req.params.itemId, req.body));
  }),
  search: asyncHandler(async (req, res) => {
    const stores = req.query.stores ? String(req.query.stores).split(',') : undefined;
    const result = await gearService.search(
      String(req.query.q),
      stores,
      req.query.limit ? Number(req.query.limit) : 20,
    );
    res.status(result.partial ? 207 : 200).json(result);
  }),
  product: asyncHandler(async (req, res) => {
    res.json(await gearService.product(req.params.store, req.params.externalId));
  }),
};
