import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shelters = pgTable("shelters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  type: text("type").notNull(), // 'public', 'commercial', 'religious', 'transport'
  occupancyLevel: text("occupancy_level").notNull(), // 'low', 'medium', 'high'
  currentOccupancy: integer("current_occupancy").default(0),
  maxCapacity: integer("max_capacity").notNull(),
  operatingHours: text("operating_hours").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  amenities: text("amenities").array().default([]), // 'wifi', 'free', 'cafe', 'parking', 'quiet'
  description: text("description"),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  temperature: decimal("temperature", { precision: 4, scale: 1 }).notNull(),
  heatIndex: decimal("heat_index", { precision: 4, scale: 1 }),
  weatherAlert: text("weather_alert"), // 'heat_warning', 'heat_advisory', etc.
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  shelterId: varchar("shelter_id").notNull().references(() => shelters.id),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertShelterSchema = createInsertSchema(shelters).omit({
  id: true,
  lastUpdated: true,
});

export const insertWeatherSchema = createInsertSchema(weatherData).omit({
  id: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertShelter = z.infer<typeof insertShelterSchema>;
export type Shelter = typeof shelters.$inferSelect;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertFavoriteSchema>;

// Additional types for API responses
export type ShelterWithDistance = Shelter & {
  distance: number;
  recommendationScore?: number;
};

export type AIRecommendation = {
  shelter: ShelterWithDistance;
  rank: number;
  reason: string;
};
