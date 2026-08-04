import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
  jsonb,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("user_role", ["user", "host", "guide", "admin"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "like",
  "comment",
  "follow",
  "mention",
  "message",
  "live",
  "system",
  "booking",
  "badge",
  "order",
  "promo",
]);
export const liveStatusEnum = pgEnum("live_status", ["scheduled", "live", "ended"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "image", "audio", "video"]);
export const postTypeEnum = pgEnum("post_type", ["text", "photo", "video", "carousel", "tip", "review", "promo"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);
export const productTypeEnum = pgEnum("product_type", [
  "physical",
  "digital",
  "experience",
  "service",
]);
export const promoStatusEnum = pgEnum("promo_status", ["active", "paused", "ended"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected", "refunded"]);
export const platformEnum = pgEnum("platform", ["ios", "android", "web"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 40 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 24 }),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 80 }).notNull(),
    bio: text("bio").default("").notNull(),
    avatarUrl: text("avatar_url"),
    coverUrl: text("cover_url"),
    location: varchar("location", { length: 120 }),
    role: roleEnum("role").default("user").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isBanned: boolean("is_banned").default(false).notNull(),
    isPremium: boolean("is_premium").default(false).notNull(),
    premiumUntil: timestamp("premium_until", { withTimezone: true }),
    xp: integer("xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    moris: integer("moris").default(100).notNull(),
    credits: integer("credits").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_username_unique").on(t.username),
    uniqueIndex("users_email_unique").on(t.email),
  ],
);

export const inns = pgTable(
  "inns",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description").default("").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).default("Brasil").notNull(),
    coverUrl: text("cover_url"),
    pricePerNight: integer("price_per_night").default(0).notNull(),
    rating: integer("rating").default(0).notNull(),
    amenities: jsonb("amenities").$type<string[]>().default([]).notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    acceptsBookings: boolean("accepts_bookings").default(false).notNull(),
    commissionPct: integer("commission_pct").default(10).notNull(),
    totalBookings: integer("total_bookings").default(0).notNull(),
    revenueMoris: integer("revenue_moris").default(0).notNull(),
    featuredUntil: timestamp("featured_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("inns_slug_unique").on(t.slug)],
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    innId: integer("inn_id").references(() => inns.id, { onDelete: "set null" }),
    type: postTypeEnum("type").default("text").notNull(),
    content: text("content").default("").notNull(),
    imageUrl: text("image_url"),
    mediaUrls: jsonb("media_urls").$type<string[]>().default([]).notNull(),
    videoUrl: text("video_url"),
    filter: varchar("filter", { length: 40 }),
    location: varchar("location", { length: 160 }),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    isHidden: boolean("is_hidden").default(false).notNull(),
    isSponsored: boolean("is_sponsored").default(false).notNull(),
    promoId: integer("promo_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("posts_author_idx").on(t.authorId), index("posts_created_idx").on(t.createdAt)],
);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const likes = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reaction: varchar("reaction", { length: 20 }).default("heart").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("likes_post_user_unique").on(t.postId, t.userId)],
);

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("follows_pair_unique").on(t.followerId, t.followingId)],
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  type: notificationTypeEnum("type").notNull(),
  entityId: integer("entity_id"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  isGroup: boolean("is_group").default(false).notNull(),
  title: varchar("title", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("conv_members_unique").on(t.conversationId, t.userId)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: messageTypeEnum("type").default("text").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("messages_conv_idx").on(t.conversationId, t.createdAt)],
);

export const lives = pgTable("lives", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").default("").notNull(),
  status: liveStatusEnum("status").default("scheduled").notNull(),
  roomId: varchar("room_id", { length: 60 }).notNull(),
  viewerCount: integer("viewer_count").default(0).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const liveMessages = pgTable("live_messages", {
  id: serial("id").primaryKey(),
  liveId: integer("live_id")
    .notNull()
    .references(() => lives.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rtcSignals = pgTable(
  "rtc_signals",
  {
    id: serial("id").primaryKey(),
    roomId: varchar("room_id", { length: 60 }).notNull(),
    fromUserId: integer("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toUserId: integer("to_user_id").references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 20 }).notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("rtc_room_idx").on(t.roomId, t.createdAt)],
);

export const moments = pgTable(
  "moments",
  {
    id: serial("id").primaryKey(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaUrl: text("media_url").notNull(),
    mediaType: varchar("media_type", { length: 20 }).default("image").notNull(),
    caption: text("caption").default("").notNull(),
    filter: varchar("filter", { length: 40 }),
    durationHours: integer("duration_hours").default(24).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("moments_expires_idx").on(t.expiresAt), index("moments_author_idx").on(t.authorId)],
);

export const momentViews = pgTable(
  "moment_views",
  {
    id: serial("id").primaryKey(),
    momentId: integer("moment_id")
      .notNull()
      .references(() => moments.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("moment_views_unique").on(t.momentId, t.userId)],
);

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").default("").notNull(),
  coverUrl: text("cover_url"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  days: integer("days").default(1).notNull(),
  budget: integer("budget").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  stops: jsonb("stops")
    .$type<Array<{ day: number; title: string; description: string; location?: string }>>()
    .default([])
    .notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: varchar("headline", { length: 160 }).notNull(),
  about: text("about").default("").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  languages: jsonb("languages").$type<string[]>().default(["Português"]).notNull(),
  specialties: jsonb("specialties").$type<string[]>().default([]).notNull(),
  pricePerDay: integer("price_per_day").default(0).notNull(),
  rating: real("rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  innId: integer("inn_id")
    .notNull()
    .references(() => inns.id, { onDelete: "cascade" }),
  checkIn: timestamp("check_in", { withTimezone: true }).notNull(),
  checkOut: timestamp("check_out", { withTimezone: true }).notNull(),
  guests: integer("guests").default(1).notNull(),
  nights: integer("nights").notNull(),
  totalPrice: integer("total_price").notNull(),
  paidWithMoris: integer("paid_with_moris").default(0).notNull(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 40 }).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  description: text("description").default("").notNull(),
  icon: varchar("icon", { length: 10 }).default("🏅").notNull(),
  xpReward: integer("xp_reward").default(50).notNull(),
  morisReward: integer("moris_reward").default(0).notNull(),
  requirement: varchar("requirement", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("badges_key_unique").on(t.key)]);

export const userBadges = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: integer("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_badges_unique").on(t.userId, t.badgeId)],
);

export const creditPackages = pgTable("credit_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  credits: integer("credits").notNull(),
  priceMoris: integer("price_moris").notNull(),
  bonusCredits: integer("bonus_credits").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").references(() => posts.id, { onDelete: "set null" }),
  productId: integer("product_id"),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").default("").notNull(),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  creditsSpent: integer("credits_spent").notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  status: promoStatusEnum("status").default("active").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).defaultNow().notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  innId: integer("inn_id").references(() => inns.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").default("").notNull(),
  type: productTypeEnum("type").default("physical").notNull(),
  priceMoris: integer("price_moris").notNull(),
  stock: integer("stock").default(1).notNull(),
  imageUrl: text("image_url"),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  city: varchar("city", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  salesCount: integer("sales_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").default(1).notNull(),
  totalMoris: integer("total_moris").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 40 }).notNull(),
  amountMoris: integer("amount_moris").default(0).notNull(),
  amountCredits: integer("amount_credits").default(0).notNull(),
  description: text("description").default("").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mpPayments = pgTable("mp_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  preferenceId: varchar("preference_id", { length: 120 }).notNull(),
  paymentId: varchar("payment_id", { length: 120 }),
  amountBrl: real("amount_brl").notNull(),
  morisCredited: integer("moris_credited").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 60 }).notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("settings_key_unique").on(t.key)]);

// ===== Mobile Apps & Feature Flags (Admin Controlled) =====
export const mobileApps = pgTable("mobile_apps", {
  id: serial("id").primaryKey(),
  platform: platformEnum("platform").notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  buildNumber: integer("build_number").default(1).notNull(),
  isForceUpdate: boolean("is_force_update").default(false).notNull(),
  minSupportedVersion: varchar("min_supported_version", { length: 20 }).default("1.0.0").notNull(),
  storeUrl: text("store_url"),
  releaseNotes: text("release_notes").default("").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 60 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").default("").notNull(),
  enabledForRoles: jsonb("enabled_for_roles").$type<string[]>().default(["user", "host", "guide", "admin"]).notNull(),
  enabledForPremium: boolean("enabled_for_premium").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("feature_flags_key_unique").on(t.key)]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  inn: one(inns, { fields: [posts.innId], references: [inns.id] }),
  comments: many(comments),
  likes: many(likes),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Inn = typeof inns.$inferSelect;
export type Moment = typeof moments.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type MobileApp = typeof mobileApps.$inferSelect;
