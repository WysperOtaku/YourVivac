import axios from 'axios';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import type { CreatePinRequest, Pin } from '@yourvivac/types';
import { PinModel } from '../../models/pin.model.js';
import { TripModel } from '../../models/trip.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { emitToTrip } from '../../realtime/index.js';
import { HttpError } from '../../middleware/error.js';

const sanitizeOpts: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'h4', 'br'],
  allowedAttributes: { a: ['href'] },
};

async function assertMember(tripId: string, userId: string) {
  const trip = await TripModel.findById(tripId).select('members owner stats');
  if (!trip) throw HttpError.notFound('Salida no encontrada');
  if (!trip.members.some((m) => String(m.userId) === userId)) {
    throw HttpError.forbidden('No eres miembro de esta salida');
  }
  return trip;
}

/** Descarga la URL y extrae título/descripción/imagen/dominio (resiliente a fallos). */
async function unfurl(url: string): Promise<Record<string, string | undefined>> {
  const base = { url, domain: safeDomain(url) };
  try {
    const { data } = await axios.get<string>(url, {
      timeout: 6000,
      headers: { 'User-Agent': 'YourVivacBot/0.1 (+https://yourvivac.app)' },
      maxContentLength: 2_000_000,
    });
    const $ = cheerio.load(data);
    const meta = (p: string) => $(`meta[property="${p}"]`).attr('content') ?? $(`meta[name="${p}"]`).attr('content');
    return {
      ...base,
      title: meta('og:title') ?? $('title').first().text() ?? undefined,
      description: meta('og:description') ?? meta('description') ?? undefined,
      image: meta('og:image') ?? undefined,
    };
  } catch {
    return base;
  }
}

function safeDomain(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export const boardService = {
  async board(tripId: string, userId: string): Promise<Pin[]> {
    await assertMember(tripId, userId);
    const pins = await PinModel.find({ tripId }).sort({ createdAt: 1 });
    return serializeDocs<Pin>(pins);
  },

  async createPin(tripId: string, userId: string, input: CreatePinRequest): Promise<Pin> {
    const trip = await assertMember(tripId, userId);
    const data: Record<string, unknown> = {
      tripId,
      authorId: userId,
      type: input.type,
      layout: input.layout,
    };

    switch (input.type) {
      case 'note':
        data.note = { markdown: sanitizeHtml(input.note!.markdown, sanitizeOpts) };
        break;
      case 'text':
        data.text = { body: sanitizeHtml(input.text!.body, sanitizeOpts), color: input.text!.color };
        break;
      case 'photo':
        data.photo = input.photo;
        break;
      case 'link':
        data.link = await unfurl(input.link!.url);
        break;
      case 'map':
        data.map = input.map;
        break;
      case 'list':
        data.list = input.list;
        break;
      case 'topo':
        data.topo = input.topo;
        break;
      case 'route':
        data.route = input.route;
        break;
    }

    const pin = await PinModel.create(data);
    await TripModel.updateOne({ _id: tripId }, { $inc: { 'stats.pinCount': 1 } });
    const serialized = serializeDoc<Pin>(pin);
    emitToTrip(String(trip._id), 'pin:add', serialized);
    return serialized;
  },

  async updatePin(pinId: string, userId: string, patch: Record<string, unknown>): Promise<Pin> {
    const pin = await PinModel.findById(pinId);
    if (!pin) throw HttpError.notFound('Pin no encontrado');
    const trip = await TripModel.findById(pin.tripId).select('owner');
    const isAuthor = String(pin.authorId) === userId;
    const isOwner = trip && String(trip.owner) === userId;
    if (!isAuthor && !isOwner) throw HttpError.forbidden('Sin permiso sobre este pin');

    if (patch.layout) pin.set('layout', { ...pin.layout, ...(patch.layout as object) });
    if (patch.note) pin.set('note', { markdown: sanitizeHtml(String((patch.note as { markdown: string }).markdown), sanitizeOpts) });
    if (patch.text) pin.set('text', { ...pin.text, ...(patch.text as object) });
    await pin.save();
    const serialized = serializeDoc<Pin>(pin);
    emitToTrip(String(pin.tripId), 'pin:update', serialized);
    return serialized;
  },

  async deletePin(pinId: string, userId: string): Promise<void> {
    const pin = await PinModel.findById(pinId);
    if (!pin) throw HttpError.notFound('Pin no encontrado');
    const trip = await TripModel.findById(pin.tripId).select('owner');
    const isAuthor = String(pin.authorId) === userId;
    const isOwner = trip && String(trip.owner) === userId;
    if (!isAuthor && !isOwner) throw HttpError.forbidden('Sin permiso sobre este pin');
    const tripId = String(pin.tripId);
    await pin.deleteOne();
    await TripModel.updateOne({ _id: tripId }, { $inc: { 'stats.pinCount': -1 } });
    emitToTrip(tripId, 'pin:remove', { id: pinId });
  },

  async react(pinId: string, userId: string, emoji: string): Promise<Pin> {
    const pin = await PinModel.findById(pinId);
    if (!pin) throw HttpError.notFound('Pin no encontrado');
    const idx = pin.reactions.findIndex((r) => String(r.userId) === userId && r.emoji === emoji);
    if (idx >= 0) {
      pin.reactions.splice(idx, 1);
    } else {
      pin.reactions.push({ userId: userId as never, emoji });
    }
    await pin.save();
    const serialized = serializeDoc<Pin>(pin);
    emitToTrip(String(pin.tripId), 'pin:update', serialized);
    return serialized;
  },
};
