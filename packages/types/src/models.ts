// Interfaces de los modelos de datos (Guía de desarrollo §11).
// Fuente única de la forma de los datos para web, móvil y API.

import type {
  ActivityType,
  AuthProvider,
  BoardLayout,
  CommentTargetType,
  Density,
  FontPair,
  GearListVisibility,
  GuideApplicationStatus,
  MediaModerationStatus,
  MemberRole,
  MessageType,
  ModerationStatus,
  NotificationType,
  PinType,
  ReactionTargetType,
  ReportStatus,
  Rsvp,
  StoreKey,
  ThemeName,
  TipCategory,
  TipStatus,
  TripDifficulty,
  TripStatus,
  TripVisibility,
  Units,
  UserRole,
  UserStatus,
} from './enums.js';
import type { GeoCoords, Id, ISODateString, MediaRef, PlaceLocation, Timestamps, WithId } from './common.js';

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export interface UserAuthProvider {
  provider: AuthProvider;
  providerId?: string;
  linkedAt: ISODateString;
}

export interface GuideProfile {
  status: GuideApplicationStatus;
  certification?: string;
  certBody?: string;
  verifiedAt?: ISODateString;
  verifiedBy?: Id;
}

export interface UserStats {
  trips: number;
  vivacs: number;
  distanceKm: number;
  elevationGain: number;
}

export interface Achievement {
  key: string;
  label: string;
  earnedAt: ISODateString;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  tripInvites: boolean;
  messages: boolean;
  mentions: boolean;
}

export interface UserSettings {
  theme: ThemeName;
  density: Density;
  fontPair: FontPair;
  units: Units;
  defaultTripVisibility: TripVisibility;
  profileVisibility: TripVisibility;
  notifications: NotificationSettings;
}

export interface UserCounts {
  followers: number;
  following: number;
}

export interface User extends WithId, Timestamps {
  displayName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  authProviders: UserAuthProvider[];
  avatar?: MediaRef;
  bio?: string;
  location?: PlaceLocation;
  role: UserRole;
  guide?: GuideProfile;
  stats: UserStats;
  achievements: Achievement[];
  settings: UserSettings;
  counts: UserCounts;
  status: UserStatus;
  lastActiveAt?: ISODateString;
}

/** Vista pública reducida de un usuario (para listados, autores, miembros). */
export interface PublicUser extends WithId {
  displayName: string;
  username: string;
  avatar?: MediaRef;
  role: UserRole;
  guide?: Pick<GuideProfile, 'status' | 'certBody'>;
}

// ---------------------------------------------------------------------------
// guideApplications
// ---------------------------------------------------------------------------
export interface GuideApplication extends WithId, Timestamps {
  userId: Id;
  certification: string;
  certBody: string;
  documents: MediaRef[];
  status: GuideApplicationStatus;
  reviewedBy?: Id;
  reviewedAt?: ISODateString;
  notes?: string;
}

// ---------------------------------------------------------------------------
// trips
// ---------------------------------------------------------------------------
export interface TripMember {
  userId: Id;
  role: MemberRole;
  rsvp: Rsvp;
  joinedAt: ISODateString;
}

export interface TripLocation {
  name: string;
  coords: GeoCoords;
  placeId?: string;
}

export interface TripStats {
  pinCount: number;
  photoCount: number;
  kudos: number;
  commentCount: number;
}

export interface Trip extends WithId, Timestamps {
  title: string;
  slug: string;
  cover?: MediaRef;
  description?: string;
  owner: Id;
  members: TripMember[];
  startDate: ISODateString;
  endDate: ISODateString;
  location: TripLocation;
  difficulty: TripDifficulty;
  distanceKm: number;
  elevationGain: number;
  visibility: TripVisibility;
  status: TripStatus;
  gpx?: MediaRef;
  stats: TripStats;
  completedAt?: ISODateString;
  /** Identidades públicas de los miembros (poblado por el API en lecturas). */
  memberUsers?: PublicUser[];
}

// ---------------------------------------------------------------------------
// pins (discriminado por type)
// ---------------------------------------------------------------------------
export interface PinLayout {
  x: number;
  y: number;
  rotation: number;
  z: number;
  w: number;
}

export interface PinReaction {
  userId: Id;
  emoji: string;
}

interface PinBase extends WithId, Timestamps {
  tripId: Id;
  authorId: Id;
  layout: PinLayout;
  reactions: PinReaction[];
}

export interface NotePin extends PinBase {
  type: 'note';
  note: { markdown: string };
}

export interface TextPin extends PinBase {
  type: 'text';
  text: { body: string; color: string };
}

export interface PhotoPin extends PinBase {
  type: 'photo';
  photo: { media: MediaRef; caption?: string };
}

export interface LinkPin extends PinBase {
  type: 'link';
  link: { url: string; title?: string; description?: string; image?: string; domain?: string };
}

export interface MapPin extends PinBase {
  type: 'map';
  map: { label: string; coords: GeoCoords; placeId?: string; address?: string; elevation?: number; path?: GeoCoords[] };
}

export interface ListPin extends PinBase {
  type: 'list';
  list: { gearListId: Id };
}

export type Pin = NotePin | TextPin | PhotoPin | LinkPin | MapPin | ListPin;

// ---------------------------------------------------------------------------
// gearLists
// ---------------------------------------------------------------------------
export interface GearProduct {
  storeKey: StoreKey;
  title: string;
  url: string;
  price?: number;
  currency?: string;
  image?: string;
  externalId?: string;
}

export interface GearItem {
  id: Id;
  name: string;
  weightGrams?: number;
  checked: boolean;
  addedBy: Id;
  product?: GearProduct;
}

export interface GearList extends WithId, Timestamps {
  ownerId: Id;
  name: string;
  description?: string;
  icon?: string;
  items: GearItem[];
  totalWeight: number;
  isTemplate: boolean;
  usedInTrips: Id[];
  visibility: GearListVisibility;
}

// ---------------------------------------------------------------------------
// messages
// ---------------------------------------------------------------------------
export interface MessageReadReceipt {
  userId: Id;
  at: ISODateString;
}

export interface Message extends WithId, Timestamps {
  tripId: Id;
  authorId: Id | null;
  type: MessageType;
  body?: string;
  pinRef?: Id;
  attachments?: MediaRef[];
  readBy: MessageReadReceipt[];
  editedAt?: ISODateString;
  deletedAt?: ISODateString;
}

// ---------------------------------------------------------------------------
// tips
// ---------------------------------------------------------------------------
export interface TipModeration {
  status: ModerationStatus;
  reviewedBy?: Id;
}

export interface TipCounts {
  likes: number;
  comments: number;
  views: number;
}

export interface Tip extends WithId, Timestamps {
  authorId: Id;
  title: string;
  slug: string;
  cover?: MediaRef;
  excerpt?: string;
  category: TipCategory;
  contentMarkdown: string;
  readMinutes: number;
  tags: string[];
  status: TipStatus;
  moderation: TipModeration;
  counts: TipCounts;
  publishedAt?: ISODateString;
}

// ---------------------------------------------------------------------------
// follows · reactions · comments
// ---------------------------------------------------------------------------
export interface Follow extends WithId, Timestamps {
  followerId: Id;
  followingId: Id;
}

export interface Reaction extends WithId, Timestamps {
  userId: Id;
  targetType: ReactionTargetType;
  targetId: Id;
}

export interface Comment extends WithId, Timestamps {
  authorId: Id;
  targetType: CommentTargetType;
  targetId: Id;
  body: string;
  parentId?: Id;
}

// ---------------------------------------------------------------------------
// notifications
// ---------------------------------------------------------------------------
export interface NotificationTarget {
  type: string;
  id: Id;
}

export interface NotificationChannels {
  push: boolean;
  email: boolean;
}

export interface Notification extends WithId, Timestamps {
  userId: Id;
  type: NotificationType;
  actorId?: Id;
  target?: NotificationTarget;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: ISODateString;
  channels: NotificationChannels;
}

// ---------------------------------------------------------------------------
// activities
// ---------------------------------------------------------------------------
export interface Activity extends WithId, Timestamps {
  actorId: Id;
  type: ActivityType;
  tripId?: Id;
  tipId?: Id;
  visibility: TripVisibility;
}

// ---------------------------------------------------------------------------
// reports · sessions · media · dailyMetrics
// ---------------------------------------------------------------------------
export interface Report extends WithId, Timestamps {
  reporterId: Id;
  targetType: string;
  targetId: Id;
  reason: string;
  description?: string;
  status: ReportStatus;
  handledBy?: Id;
  resolvedAt?: ISODateString;
}

export interface Session extends WithId, Timestamps {
  userId: Id;
  tokenHash: string;
  device?: string;
  ip?: string;
  userAgent?: string;
  expiresAt: ISODateString;
  revokedAt?: ISODateString;
}

export interface Media extends WithId, Timestamps {
  uploaderId: Id;
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  moderation: {
    status: MediaModerationStatus;
    labels: string[];
    provider?: string;
  };
}

export interface DailyMetrics extends WithId {
  date: string;
  newUsers: number;
  activeUsers: number;
  tripsCreated: number;
  tipsPublished: number;
  guidesVerified: number;
  reports: number;
}
