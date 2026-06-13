// DTOs de request/response por endpoint (Guía de desarrollo §12).

import type { GeoCoords, Id, MediaRef } from './common.js';
import type {
  Density,
  FontPair,
  PinType,
  Rsvp,
  StoreKey,
  ThemeName,
  TipCategory,
  TripDifficulty,
  TripVisibility,
  Units,
} from './enums.js';
import type { PublicUser, Tip, Trip, User } from './models.js';

// --- Auth ---
export interface GoogleAuthRequest {
  idToken: string;
}
export interface RegisterRequest {
  displayName: string;
  username: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthResponse {
  user: User;
  accessToken: string;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  token: string;
  password: string;
}
export interface VerifyEmailRequest {
  token: string;
}

// --- Users / settings / social ---
export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  location?: { name: string; coords?: GeoCoords };
}
export interface UpdateSettingsRequest {
  theme?: ThemeName;
  density?: Density;
  fontPair?: FontPair;
  units?: Units;
  defaultTripVisibility?: TripVisibility;
  notifications?: Partial<User['settings']['notifications']>;
}
export interface UserProfileResponse {
  user: PublicUser & Pick<User, 'bio' | 'location' | 'stats' | 'achievements' | 'counts'>;
  isFollowing?: boolean;
}

// --- Guide ---
export interface GuideApplyRequest {
  certification: string;
  certBody: string;
  documents: MediaRef[];
}

// --- Trips ---
export interface CreateTripRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: { name: string; coords: GeoCoords; placeId?: string };
  difficulty: TripDifficulty;
  visibility: TripVisibility;
  distanceKm?: number;
  elevationGain?: number;
}
export type UpdateTripRequest = Partial<CreateTripRequest>;
export interface InviteRequest {
  users: string[]; // userIds o handles
}
export interface RsvpRequest {
  rsvp: Rsvp;
}
export interface ExploreTripsQuery {
  q?: string;
  difficulty?: TripDifficulty;
  near?: string; // "lat,lng"
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

// --- Board / pins ---
export interface PinLayoutInput {
  x: number;
  y: number;
  rotation?: number;
  z?: number;
  w?: number;
}
export interface CreatePinRequest {
  type: PinType;
  layout: PinLayoutInput;
  note?: { markdown: string };
  text?: { body: string; color: string };
  photo?: { media: MediaRef; caption?: string };
  link?: { url: string };
  map?: { label: string; coords: GeoCoords; placeId?: string; address?: string };
  list?: { gearListId: Id };
}
export interface UpdatePinRequest {
  layout?: PinLayoutInput;
  note?: { markdown: string };
  text?: { body?: string; color?: string };
}
export interface ReactionRequest {
  emoji: string;
}

// --- Gear & products (proxy a Cordal) ---
export interface CreateGearListRequest {
  name: string;
  description?: string;
  icon?: string;
  visibility?: 'private' | 'trip' | 'public';
}
export interface GearItemInput {
  name: string;
  weightGrams?: number;
  product?: {
    storeKey: StoreKey;
    title: string;
    url: string;
    price?: number;
    currency?: string;
    image?: string;
    externalId?: string;
  };
}
export interface UpdateGearItemRequest {
  name?: string;
  weightGrams?: number;
  checked?: boolean;
}

/** Forma de la respuesta del agregador Cordal (sólo se consume, no se construye). */
export interface ProductOffer {
  store: StoreKey;
  price: number;
  currency: string;
  url: string;
}
export interface AggregatedProduct {
  product: string;
  brand?: string;
  ean?: string;
  image?: string;
  externalId?: string;
  offers: ProductOffer[];
}
export interface ProductSearchResponse {
  query: string;
  stores: StoreKey[];
  cached: boolean;
  partial: boolean;
  fetchedAt: string;
  results: AggregatedProduct[];
}
export interface ProductSearchQuery {
  q: string;
  stores?: string; // csv
  limit?: number;
}

// --- Chat ---
export interface SendMessageRequest {
  body?: string;
  type?: 'text' | 'pin_share';
  pinRef?: Id;
  attachments?: MediaRef[];
}

// --- Tips ---
export interface CreateTipRequest {
  title: string;
  category: TipCategory;
  contentMarkdown: string;
  excerpt?: string;
  cover?: MediaRef;
  tags?: string[];
  status?: 'draft' | 'published';
}
export type UpdateTipRequest = Partial<CreateTipRequest>;
export interface CommentRequest {
  body: string;
  parentId?: Id;
}
export interface TipsQuery {
  category?: TipCategory;
  page?: number;
  pageSize?: number;
}

// --- Admin ---
export interface AdminUpdateUserRequest {
  role?: 'user' | 'guide' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
}
export interface AdminReviewGuideRequest {
  decision: 'approve' | 'reject';
  notes?: string;
}
export interface AdminResolveReportRequest {
  status: 'resolved' | 'dismissed';
  action?: 'hide_content' | 'suspend_user' | 'none';
}
export interface MetricsTimeseriesQuery {
  from: string;
  to: string;
  metric: 'newUsers' | 'activeUsers' | 'tripsCreated' | 'tipsPublished';
}

// --- Feed (home) ---
export interface FeedItem {
  activityId: Id;
  actor: PublicUser;
  type: 'trip_completed' | 'tip_published' | 'achievement';
  trip?: Pick<Trip, 'id' | 'title' | 'slug' | 'cover'>;
  tip?: Pick<Tip, 'id' | 'title' | 'slug' | 'cover'>;
  createdAt: string;
}
