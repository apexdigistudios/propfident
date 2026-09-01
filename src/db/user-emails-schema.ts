import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const userEmails = pgTable("user_emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("pricing_waitlist"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
