import { asyncHandler, HttpError } from '../../middleware/error.js';
import { usersService } from './users.service.js';

export const usersController = {
  profile: asyncHandler(async (req, res) => {
    res.json(await usersService.profile(req.params.username, req.user?.userId));
  }),
  updateMe: asyncHandler(async (req, res) => {
    res.json(await usersService.updateMe(req.user!.userId, req.body));
  }),
  updateSettings: asyncHandler(async (req, res) => {
    res.json(await usersService.updateSettings(req.user!.userId, req.body));
  }),
  avatar: asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('Falta el archivo de avatar');
    res.json(await usersService.setAvatar(req.user!.userId, req.file));
  }),
  trips: asyncHandler(async (req, res) => {
    res.json(await usersService.userTrips(req.params.id));
  }),
  tips: asyncHandler(async (req, res) => {
    res.json(await usersService.userTips(req.params.id));
  }),
  follow: asyncHandler(async (req, res) => {
    await usersService.follow(req.user!.userId, req.params.id);
    res.status(204).end();
  }),
  unfollow: asyncHandler(async (req, res) => {
    await usersService.unfollow(req.user!.userId, req.params.id);
    res.status(204).end();
  }),
};
