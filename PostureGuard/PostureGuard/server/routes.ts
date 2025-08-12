import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostureSessionSchema, insertUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Posture Sessions
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertPostureSessionSchema.parse(req.body);
      const session = await storage.createPostureSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage.updatePostureSession(id, updates);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update session" });
    }
  });

  app.get("/api/sessions/current/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const session = await storage.getCurrentSession(userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to get current session" });
    }
  });

  app.get("/api/sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getPostureSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  // User Settings
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create default settings if none exist
        settings = await storage.createUserSettings({ userId });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.patch("/api/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      let settings = await storage.getUserSettings(userId);
      if (!settings) {
        // Create settings if they don't exist
        settings = await storage.createUserSettings({ userId, ...updates });
      } else {
        settings = await storage.updateUserSettings(userId, updates);
      }
      
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
