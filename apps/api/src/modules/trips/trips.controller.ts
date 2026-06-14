import { asyncHandler } from '../../middleware/error.js';
import { tripsService } from './trips.service.js';

export const tripsController = {
  create: asyncHandler(async (req, res) => {
    res.status(201).json(await tripsService.create(req.user!.userId, req.body));
  }),
  list: asyncHandler(async (req, res) => {
    res.json(await tripsService.listForUser(req.user!.userId));
  }),
  get: asyncHandler(async (req, res) => {
    res.json(await tripsService.getForMember(req.params.id, req.user!.userId));
  }),
  update: asyncHandler(async (req, res) => {
    res.json(await tripsService.update(req.params.id, req.user!.userId, req.body));
  }),
  remove: asyncHandler(async (req, res) => {
    await tripsService.remove(req.params.id, req.user!.userId);
    res.status(204).end();
  }),
  invite: asyncHandler(async (req, res) => {
    res.json(await tripsService.invite(req.params.id, req.user!.userId, req.body.users));
  }),
  rsvp: asyncHandler(async (req, res) => {
    res.json(await tripsService.rsvp(req.params.id, req.user!.userId, req.body.rsvp));
  }),
  complete: asyncHandler(async (req, res) => {
    res.json(await tripsService.complete(req.params.id, req.user!.userId));
  }),
  explore: asyncHandler(async (req, res) => {
    res.json(
      await tripsService.explore({
        q: req.query.q as string | undefined,
        difficulty: req.query.difficulty as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      }),
    );
  }),
};
