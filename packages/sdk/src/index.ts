import type { AxiosInstance } from 'axios';
import type {
  AdminResolveReportRequest,
  AdminReviewGuideRequest,
  AdminUpdateUserRequest,
  AggregatedProduct,
  AuthResponse,
  ChangePasswordRequest,
  CreateGearListRequest,
  CreatePinRequest,
  CreateTipRequest,
  CreateTripRequest,
  FeedItem,
  ForgotPasswordRequest,
  GearItemInput,
  GearList,
  GoogleAuthRequest,
  GuideApplication,
  GuideApplyRequest,
  InviteRequest,
  LoginRequest,
  Media,
  Message,
  Notification,
  Paginated,
  Pin,
  PinLayoutInput,
  ProductSearchResponse,
  RegisterRequest,
  Report,
  ResetPasswordRequest,
  RsvpRequest,
  SendMessageRequest,
  Tip,
  Trip,
  UpdateGearItemRequest,
  UpdateSettingsRequest,
  UpdateTripRequest,
  UpdateUserRequest,
  User,
  UserProfileResponse,
  UserSearchResult,
  VerifyEmailRequest,
} from '@yourvivac/types';

/** Métricas agregadas del panel admin. */
export interface AdminMetrics {
  users: number;
  trips: number;
  tips: number;
  pendingGuides: number;
  openReports: number;
}
/** Punto de una serie temporal del panel admin. */
export interface AdminTimeseriesPoint {
  date: string;
  value: number;
}
import { createHttpClient, type ApiClientOptions } from './client.js';

export * from './client.js';

/** Cliente tipado de la API de YourVivac. Una función por endpoint (§12). */
export function createApiClient(options: ApiClientOptions) {
  const { http, tokenStore } = createHttpClient(options);
  const data =
    <T>(p: Promise<{ data: T }>): Promise<T> =>
      p.then((r) => r.data);

  const api = {
    http: http as AxiosInstance,
    tokenStore,

    auth: {
      google: (b: GoogleAuthRequest) => data<AuthResponse>(http.post('/auth/google', b)),
      register: (b: RegisterRequest) => data<AuthResponse>(http.post('/auth/register', b)),
      login: (b: LoginRequest) => data<AuthResponse>(http.post('/auth/login', b)),
      refresh: () => data<{ accessToken: string }>(http.post('/auth/refresh')),
      logout: () => data<void>(http.post('/auth/logout')),
      me: () => data<User>(http.get('/auth/me')),
      changePassword: (b: ChangePasswordRequest) => data<{ ok: true }>(http.post('/auth/change-password', b)),
      verifyEmail: (b: VerifyEmailRequest) => data<{ ok: true }>(http.post('/auth/verify-email', b)),
      forgotPassword: (b: ForgotPasswordRequest) =>
        data<{ ok: true }>(http.post('/auth/forgot-password', b)),
      resetPassword: (b: ResetPasswordRequest) =>
        data<{ ok: true }>(http.post('/auth/reset-password', b)),
    },

    users: {
      profile: (username: string) =>
        data<UserProfileResponse>(http.get(`/users/${username}`)),
      search: (q: string) => data<UserSearchResult[]>(http.get('/users/search', { params: { q } })),
      updateMe: (b: UpdateUserRequest) => data<User>(http.patch('/users/me', b)),
      updateSettings: (b: UpdateSettingsRequest) =>
        data<User>(http.patch('/users/me/settings', b)),
      follow: (id: string) => data<void>(http.post(`/users/${id}/follow`)),
      unfollow: (id: string) => data<void>(http.delete(`/users/${id}/follow`)),
      trips: (id: string) => data<Trip[]>(http.get(`/users/${id}/trips`)),
      tips: (id: string) => data<Tip[]>(http.get(`/users/${id}/tips`)),
      avatar: (file: Blob) => {
        const form = new FormData();
        form.append('file', file);
        return data<User>(http.post('/users/me/avatar', form));
      },
    },

    guide: {
      apply: (b: GuideApplyRequest) => data<GuideApplication>(http.post('/guide/apply', b)),
      application: () => data<GuideApplication | null>(http.get('/guide/application')),
    },

    media: {
      upload: (file: Blob) => {
        const form = new FormData();
        form.append('file', file);
        return data<Media>(http.post('/media/upload', form));
      },
    },

    trips: {
      create: (b: CreateTripRequest) => data<Trip>(http.post('/trips', b)),
      list: () => data<Trip[]>(http.get('/trips')),
      get: (id: string) => data<Trip>(http.get(`/trips/${id}`)),
      update: (id: string, b: UpdateTripRequest) => data<Trip>(http.patch(`/trips/${id}`, b)),
      remove: (id: string) => data<void>(http.delete(`/trips/${id}`)),
      invite: (id: string, b: InviteRequest) => data<Trip>(http.post(`/trips/${id}/invite`, b)),
      rsvp: (id: string, b: RsvpRequest) => data<Trip>(http.patch(`/trips/${id}/rsvp`, b)),
      complete: (id: string) => data<Trip>(http.post(`/trips/${id}/complete`)),
      explore: (params?: Record<string, unknown>) =>
        data<Paginated<Trip>>(http.get('/explore/trips', { params })),
    },

    board: {
      get: (tripId: string) => data<Pin[]>(http.get(`/trips/${tripId}/board`)),
      createPin: (tripId: string, b: CreatePinRequest) =>
        data<Pin>(http.post(`/trips/${tripId}/pins`, b)),
      updatePin: (
        pinId: string,
        b: { layout?: Partial<PinLayoutInput>; note?: { markdown: string }; text?: { body?: string; color?: string } },
      ) => data<Pin>(http.patch(`/pins/${pinId}`, b)),
      deletePin: (pinId: string) => data<void>(http.delete(`/pins/${pinId}`)),
      react: (pinId: string, emoji: string) =>
        data<Pin>(http.post(`/pins/${pinId}/reactions`, { emoji })),
    },

    gear: {
      list: () => data<GearList[]>(http.get('/gear-lists')),
      create: (b: CreateGearListRequest) => data<GearList>(http.post('/gear-lists', b)),
      addItem: (listId: string, b: GearItemInput) =>
        data<GearList>(http.post(`/gear-lists/${listId}/items`, b)),
      updateItem: (listId: string, itemId: string, b: UpdateGearItemRequest) =>
        data<GearList>(http.patch(`/gear-lists/${listId}/items/${itemId}`, b)),
    },

    products: {
      search: (q: string, stores?: string[]) =>
        data<ProductSearchResponse>(
          http.get('/products/search', { params: { q, stores: stores?.join(',') } }),
        ),
      get: (store: string, externalId: string) =>
        data<AggregatedProduct>(http.get(`/products/${store}/${externalId}`)),
    },

    chat: {
      history: (tripId: string, params?: Record<string, unknown>) =>
        data<Paginated<Message>>(http.get(`/trips/${tripId}/messages`, { params })),
      send: (tripId: string, b: SendMessageRequest) =>
        data<Message>(http.post(`/trips/${tripId}/messages`, b)),
      remove: (messageId: string) => data<void>(http.delete(`/messages/${messageId}`)),
    },

    tips: {
      feed: (params?: Record<string, unknown>) =>
        data<Paginated<Tip>>(http.get('/tips', { params })),
      create: (b: CreateTipRequest) => data<Tip>(http.post('/tips', b)),
      get: (slug: string) => data<Tip>(http.get(`/tips/${slug}`)),
      like: (id: string) => data<void>(http.post(`/tips/${id}/like`)),
      comment: (id: string, body: string) =>
        data<void>(http.post(`/tips/${id}/comments`, { body })),
    },

    notifications: {
      list: () => data<{ items: Notification[]; unread: number }>(http.get('/notifications')),
      readAll: () => data<void>(http.post('/notifications/read-all')),
    },

    feed: {
      home: (params?: Record<string, unknown>) =>
        data<Paginated<FeedItem>>(http.get('/feed', { params })),
    },

    admin: {
      metrics: () => data<AdminMetrics>(http.get('/admin/metrics')),
      timeseries: (params: { from: string; to: string; metric?: string }) =>
        data<AdminTimeseriesPoint[]>(http.get('/admin/metrics/timeseries', { params })),
      users: (params?: { page?: number; pageSize?: number; q?: string }) =>
        data<Paginated<User>>(http.get('/admin/users', { params })),
      updateUser: (id: string, b: AdminUpdateUserRequest) =>
        data<User>(http.patch(`/admin/users/${id}`, b)),
      guideApplications: (status?: string) =>
        data<GuideApplication[]>(http.get('/admin/guide-applications', { params: { status } })),
      reviewGuide: (id: string, b: AdminReviewGuideRequest) =>
        data<GuideApplication>(http.patch(`/admin/guide-applications/${id}`, b)),
      reports: () => data<Report[]>(http.get('/admin/reports')),
      resolveReport: (id: string, b: AdminResolveReportRequest) =>
        data<Report>(http.patch(`/admin/reports/${id}`, b)),
    },
  };

  return api;
}

export type ApiClient = ReturnType<typeof createApiClient>;
