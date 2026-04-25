// Drizzle schema — Better Auth tables + app-specific tables.
//
// Better Auth expects these exact table names and columns. We define them
// here manually (mirroring what `@better-auth/cli generate` would produce)
// so the schema is readable in one place and easy to review.
//
// If you add a Better Auth plugin (passkeys, 2FA, organizations), re-run
// `npm run auth:generate` and merge the output into this file — it will
// append only the missing plugin tables.

import { pgTable, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

// ─── Better Auth: user ───────────────────────────────────────────────────────
export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name:          text('name'),
  image:         text('image'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
});

// ─── Better Auth: session ────────────────────────────────────────────────────
export const session = pgTable('session', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Better Auth: account (credentials + future OAuth providers) ─────────────
export const account = pgTable('account', {
  id:                   text('id').primaryKey(),
  userId:               text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId:            text('account_id').notNull(),
  providerId:           text('provider_id').notNull(),
  accessToken:          text('access_token'),
  refreshToken:         text('refresh_token'),
  idToken:              text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt:timestamp('refresh_token_expires_at'),
  scope:                text('scope'),
  password:             text('password'),  // bcrypt hash, for credentials provider
  createdAt:            timestamp('created_at').notNull().defaultNow(),
  updatedAt:            timestamp('updated_at').notNull().defaultNow(),
});

// ─── Better Auth: verification (email verify + password reset tokens) ────────
export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow(),
});

// ─── App: generations history ────────────────────────────────────────────────
// Soft-delete model:
//   deletedAt IS NULL          → активная генерация, видна в /account/history
//   deletedAt IS NOT NULL      → в корзине, видна в /account/history?view=trash
//   deletedAt < NOW() - 30d    → физически удаляется cron-ом scripts/purge-trash.ts
export const generation = pgTable('generation', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  kind:         text('kind').notNull(),       // 'image' | 'video' | 'i2i' | 'i2v' | 'lipsync'
  model:        text('model').notNull(),      // 'nano-banana-pro', 'flux-dev', etc.
  prompt:       text('prompt').notNull(),
  params:       jsonb('params').notNull(),    // { aspect_ratio, resolution, seed, num_images, ... }
  resultUrl:    text('result_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  falRequestId: text('fal_request_id'),       // for fal.ai support tickets
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  deletedAt:    timestamp('deleted_at'),      // NULL = активна, иначе момент перехода в корзину
}, (t) => ({
  userTimeIdx:    index('gen_user_time_idx').on(t.userId, t.createdAt),
  // Частичный индекс по корзине помог бы, но drizzle-pg такой синтаксис
  // не выражает напрямую — этот обычный индекс достаточен для наших объёмов.
  userTrashIdx:   index('gen_user_trash_idx').on(t.userId, t.deletedAt),
}));

// Период хранения в корзине — единая константа, импортируется и API, и cron-ом.
export const TRASH_RETENTION_DAYS = 30;
