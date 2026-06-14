import { asyncHandler } from '../../middleware/error.js';
import { boardService } from './board.service.js';

export const boardController = {
  board: asyncHandler(async (req, res) => {
    res.json(await boardService.board(req.params.id, req.user!.userId));
  }),
  createPin: asyncHandler(async (req, res) => {
    res.status(201).json(await boardService.createPin(req.params.id, req.user!.userId, req.body));
  }),
  updatePin: asyncHandler(async (req, res) => {
    res.json(await boardService.updatePin(req.params.id, req.user!.userId, req.body));
  }),
  deletePin: asyncHandler(async (req, res) => {
    await boardService.deletePin(req.params.id, req.user!.userId);
    res.status(204).end();
  }),
  react: asyncHandler(async (req, res) => {
    res.json(await boardService.react(req.params.id, req.user!.userId, req.body.emoji));
  }),
};
