import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const postureSession = pgTable("posture_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  goodPostureTime: integer("good_posture_time").default(0), // in seconds
  turtleNeckWarnings: integer("turtle_neck_warnings").default(0),
  nailBitingWarnings: integer("nail_biting_warnings").default(0),
  totalWarnings: integer("total_warnings").default(0),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  turtleNeckDetectionEnabled: boolean("turtle_neck_detection_enabled").default(true),
  nailBitingDetectionEnabled: boolean("nail_biting_detection_enabled").default(true),
  turtleNeckSensitivity: integer("turtle_neck_sensitivity").default(7),
  nailBitingSensitivity: integer("nail_biting_sensitivity").default(5),
  soundNotificationsEnabled: boolean("sound_notifications_enabled").default(true),
  visualNotificationsEnabled: boolean("visual_notifications_enabled").default(true),
  notificationFrequency: text("notification_frequency").default("5s"),
  darkMode: boolean("dark_mode").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPostureSessionSchema = createInsertSchema(postureSession).omit({
  id: true,
  startTime: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PostureSession = typeof postureSession.$inferSelect;
export type InsertPostureSession = z.infer<typeof insertPostureSessionSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
