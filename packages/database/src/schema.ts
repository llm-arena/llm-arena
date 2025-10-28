import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  type PgColumn,
} from 'drizzle-orm/pg-core';

// Enums
export const configSourceEnum = pgEnum('config_source', ['manual', 'cherry-studio', 'newapi']);
export const roleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const voteTypeEnum = pgEnum('vote_type', ['like', 'neutral', 'dislike']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const userStatusEnum = pgEnum('user_status', ['active', 'disabled', 'pending']);

// Users table (synced with Supabase Auth)
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(), // References auth.users.id in Supabase
    email: text('email').notNull().unique(),
    username: text('username').unique(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    
    // Better-Auth fields
    role: userRoleEnum('role').default('user').notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    
    // OAuth identifiers (reserved for future use)
    githubId: text('github_id').unique(),
    googleId: text('google_id').unique(),
    linuxdoId: text('linuxdo_id').unique(),
    
    // Invitation system (reserved for future use)
    inviterId: uuid('inviter_id').references((): PgColumn => users.id),
    
    // Soft delete (reserved for future use)
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    // Note: githubId, googleId, linuxdoId have UNIQUE constraints which create indexes automatically
    index('users_inviter_id_idx').on(table.inviterId),
    index('users_deleted_at_idx').on(table.deletedAt),
  ],
);

// User preferences
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    theme: text('theme').default('system'),
    language: text('language').default('en'),
    defaultModels: jsonb('default_models').$type<string[]>(),
    configSource: configSourceEnum('config_source').default('manual'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('user_preferences_user_id_idx').on(table.userId),
  ],
);

// API Keys (encrypted)
export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    providerName: text('provider_name').notNull(),
    encryptedKey: text('encrypted_key').notNull(),
    configSource: configSourceEnum('config_source').default('manual'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('api_keys_user_id_idx').on(table.userId),
  ],
);

// Conversations
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('conversations_user_id_idx').on(table.userId),
  ],
);

// Messages
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    role: roleEnum('role').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('messages_conversation_id_idx').on(table.conversationId),
  ],
);

// Model responses
export const modelResponses = pgTable(
  'model_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id')
      .references(() => messages.id, { onDelete: 'cascade' })
      .notNull(),
    modelName: text('model_name').notNull(),
    providerName: text('provider_name').notNull(),
    responseContent: text('response_content').notNull(),
    tokensUsed: integer('tokens_used'),
    responseTimeMs: integer('response_time_ms'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('model_responses_message_id_idx').on(table.messageId),
  ],
);

// User votes
export const userVotes = pgTable(
  'user_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    messageId: uuid('message_id')
      .references(() => messages.id, { onDelete: 'cascade' })
      .notNull(),
    modelResponseId: uuid('model_response_id')
      .references(() => modelResponses.id, { onDelete: 'cascade' })
      .notNull(),
    voteType: voteTypeEnum('vote_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('user_votes_user_id_idx').on(table.userId),
    index('user_votes_message_id_idx').on(table.messageId),
    index('user_votes_model_response_id_idx').on(table.modelResponseId),
    unique('unique_user_model_vote').on(table.userId, table.modelResponseId),
  ],
);

// Model rankings
export const modelRankings = pgTable(
  'model_rankings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    modelName: text('model_name').notNull(),
    providerName: text('provider_name').notNull(),
    totalLikes: integer('total_likes').default(0).notNull(),
    totalDislikes: integer('total_dislikes').default(0).notNull(),
    totalNeutral: integer('total_neutral').default(0).notNull(),
    rankingScore: real('ranking_score').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('model_rankings_ranking_score_idx').on(table.rankingScore),
    unique('model_rankings_model_provider_unique').on(
      table.modelName,
      table.providerName,
    ),
  ],
);

// Files (stored as bytea)
export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    fileData: text('file_data').notNull(), // Base64 encoded for simplicity with Drizzle
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('files_user_id_idx').on(table.userId),
  ],
);

// Shared results
export const sharedResults = pgTable(
  'shared_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    shareToken: text('share_token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => [
    index('shared_results_share_token_idx').on(table.shareToken),
    index('shared_results_conversation_id_idx').on(table.conversationId),
  ],
);

// Better-Auth tables
// Session table
export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('session_user_id_idx').on(table.userId),
    // Note: token has a UNIQUE constraint which creates an index automatically
  ],
);

// Account table (OAuth)
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    password: text('password'), // For email/password
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    unique('account_provider_account_unique').on(
      table.providerId,
      table.accountId,
    ),
  ],
);

// Verification table
export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('verification_identifier_idx').on(table.identifier),
  ],
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences),
  apiKeys: many(apiKeys),
  conversations: many(conversations),
  votes: many(userVotes),
  files: many(files),
  sessions: many(session),
  accounts: many(account),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  sharedResults: many(sharedResults),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  modelResponses: many(modelResponses),
  votes: many(userVotes),
}));

export const modelResponsesRelations = relations(modelResponses, ({ one, many }) => ({
  message: one(messages, {
    fields: [modelResponses.messageId],
    references: [messages.id],
  }),
  votes: many(userVotes),
}));

export const userVotesRelations = relations(userVotes, ({ one }) => ({
  user: one(users, {
    fields: [userVotes.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [userVotes.messageId],
    references: [messages.id],
  }),
  modelResponse: one(modelResponses, {
    fields: [userVotes.modelResponseId],
    references: [modelResponses.id],
  }),
}));

export const sharedResultsRelations = relations(sharedResults, ({ one }) => ({
  conversation: one(conversations, {
    fields: [sharedResults.conversationId],
    references: [conversations.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type ModelResponse = typeof modelResponses.$inferSelect;
export type NewModelResponse = typeof modelResponses.$inferInsert;
export type UserVote = typeof userVotes.$inferSelect;
export type NewUserVote = typeof userVotes.$inferInsert;
export type ModelRanking = typeof modelRankings.$inferSelect;
export type NewModelRanking = typeof modelRankings.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type SharedResult = typeof sharedResults.$inferSelect;
export type NewSharedResult = typeof sharedResults.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

