import { type User, type InsertUser, type PostureSession, type InsertPostureSession, type UserSettings, type InsertUserSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPostureSession(session: InsertPostureSession): Promise<PostureSession>;
  updatePostureSession(id: string, updates: Partial<PostureSession>): Promise<PostureSession | undefined>;
  getPostureSessionsByUser(userId: string): Promise<PostureSession[]>;
  getCurrentSession(userId: string): Promise<PostureSession | undefined>;
  
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private postureSessions: Map<string, PostureSession>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.postureSessions = new Map();
    this.userSettings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPostureSession(insertSession: InsertPostureSession): Promise<PostureSession> {
    const id = randomUUID();
    const session: PostureSession = {
      ...insertSession,
      id,
      startTime: new Date(),
      endTime: null,
      goodPostureTime: 0,
      turtleNeckWarnings: 0,
      nailBitingWarnings: 0,
      totalWarnings: 0,
    };
    this.postureSessions.set(id, session);
    return session;
  }

  async updatePostureSession(id: string, updates: Partial<PostureSession>): Promise<PostureSession | undefined> {
    const session = this.postureSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.postureSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getPostureSessionsByUser(userId: string): Promise<PostureSession[]> {
    return Array.from(this.postureSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async getCurrentSession(userId: string): Promise<PostureSession | undefined> {
    return Array.from(this.postureSessions.values()).find(
      (session) => session.userId === userId && session.endTime === null
    );
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = randomUUID();
    const settings: UserSettings = {
      ...insertSettings,
      id,
      turtleNeckDetectionEnabled: true,
      nailBitingDetectionEnabled: true,
      turtleNeckSensitivity: 7,
      nailBitingSensitivity: 5,
      soundNotificationsEnabled: true,
      visualNotificationsEnabled: true,
      notificationFrequency: "5s",
      darkMode: false,
    };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...updates };
    this.userSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
