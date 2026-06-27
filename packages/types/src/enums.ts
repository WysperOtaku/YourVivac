// Enums compartidos — fuente única (Guía de desarrollo §11).

export const UserRole = {
  User: 'user',
  Guide: 'guide',
  Admin: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  Active: 'active',
  Suspended: 'suspended',
  Banned: 'banned',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AuthProvider = {
  Password: 'password',
  Google: 'google',
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

export const GuideApplicationStatus = {
  Pending: 'pending',
  InReview: 'in_review',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;
export type GuideApplicationStatus =
  (typeof GuideApplicationStatus)[keyof typeof GuideApplicationStatus];

export const TripDifficulty = {
  Facil: 'facil',
  Moderada: 'moderada',
  Dificil: 'dificil',
  Alpina: 'alpina',
} as const;
export type TripDifficulty = (typeof TripDifficulty)[keyof typeof TripDifficulty];

export const TripVisibility = {
  Private: 'private',
  Public: 'public',
} as const;
export type TripVisibility = (typeof TripVisibility)[keyof typeof TripVisibility];

export const TripStatus = {
  Planning: 'planning',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

export const MemberRole = {
  Owner: 'owner',
  Member: 'member',
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const Rsvp = {
  Invited: 'invited',
  Going: 'going',
  Maybe: 'maybe',
  Declined: 'declined',
} as const;
export type Rsvp = (typeof Rsvp)[keyof typeof Rsvp];

export const PinType = {
  Note: 'note',
  Photo: 'photo',
  Link: 'link',
  List: 'list',
  Map: 'map',
  Text: 'text',
  Topo: 'topo',
  Route: 'route',
} as const;
export type PinType = (typeof PinType)[keyof typeof PinType];

export const GearListVisibility = {
  Private: 'private',
  Trip: 'trip',
  Public: 'public',
} as const;
export type GearListVisibility = (typeof GearListVisibility)[keyof typeof GearListVisibility];

export const StoreKey = {
  Amazon: 'amazon',
  Decathlon: 'decathlon',
  Deporvillage: 'deporvillage',
  Barrabes: 'barrabes',
  Forum: 'forum',
  Coleman: 'coleman',
} as const;
export type StoreKey = (typeof StoreKey)[keyof typeof StoreKey];

export const MessageType = {
  Text: 'text',
  PinShare: 'pin_share',
  System: 'system',
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const TipCategory = {
  Material: 'material',
  Seguridad: 'seguridad',
  Rutas: 'rutas',
  Vivac: 'vivac',
  Meteo: 'meteo',
} as const;
export type TipCategory = (typeof TipCategory)[keyof typeof TipCategory];

export const TipStatus = {
  Draft: 'draft',
  Published: 'published',
  Archived: 'archived',
} as const;
export type TipStatus = (typeof TipStatus)[keyof typeof TipStatus];

export const ModerationStatus = {
  Ok: 'ok',
  Flagged: 'flagged',
  Removed: 'removed',
} as const;
export type ModerationStatus = (typeof ModerationStatus)[keyof typeof ModerationStatus];

export const MediaModerationStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;
export type MediaModerationStatus =
  (typeof MediaModerationStatus)[keyof typeof MediaModerationStatus];

export const ReactionTargetType = {
  Tip: 'tip',
  Trip: 'trip',
  Pin: 'pin',
} as const;
export type ReactionTargetType = (typeof ReactionTargetType)[keyof typeof ReactionTargetType];

export const CommentTargetType = {
  Tip: 'tip',
  Trip: 'trip',
} as const;
export type CommentTargetType = (typeof CommentTargetType)[keyof typeof CommentTargetType];

export const NotificationType = {
  TripInvite: 'trip_invite',
  TripJoin: 'trip_join',
  NewMessage: 'new_message',
  PinAdded: 'pin_added',
  TipLike: 'tip_like',
  Comment: 'comment',
  Follow: 'follow',
  GuideApproved: 'guide_approved',
  GuideRejected: 'guide_rejected',
  HelpRequest: 'help_request',
  Mention: 'mention',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const ActivityType = {
  TripCompleted: 'trip_completed',
  TipPublished: 'tip_published',
  Achievement: 'achievement',
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const ReportStatus = {
  Open: 'open',
  Reviewing: 'reviewing',
  Resolved: 'resolved',
  Dismissed: 'dismissed',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ThemeName = {
  Dark: 'dark',
  Light: 'light',
} as const;
export type ThemeName = (typeof ThemeName)[keyof typeof ThemeName];

export const Density = {
  Compact: 'compact',
  Regular: 'regular',
  Comfy: 'comfy',
} as const;
export type Density = (typeof Density)[keyof typeof Density];

export const FontPair = {
  A: 'a',
  B: 'b',
  C: 'c',
} as const;
export type FontPair = (typeof FontPair)[keyof typeof FontPair];

export const Units = {
  Metric: 'metric',
  Imperial: 'imperial',
} as const;
export type Units = (typeof Units)[keyof typeof Units];

export const BoardLayout = {
  Free: 'free',
  Wall: 'wall',
  Guided: 'guided',
} as const;
export type BoardLayout = (typeof BoardLayout)[keyof typeof BoardLayout];
