import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShelterSchema, insertWeatherSchema, insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all shelters
  app.get("/api/shelters", async (req, res) => {
    try {
      const shelters = await storage.getShelters();
      res.json(shelters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shelters" });
    }
  });

  // Get shelter by ID
  app.get("/api/shelters/:id", async (req, res) => {
    try {
      const shelter = await storage.getShelterById(req.params.id);
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found" });
      }
      res.json(shelter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shelter" });
    }
  });

  // Get shelters with distance from user location
  app.get("/api/shelters/nearby/:lat/:lng", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lng = parseFloat(req.params.lng);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      const shelters = await storage.getSheltersWithDistance(lat, lng);
      res.json(shelters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby shelters" });
    }
  });

  // Get AI recommendations
  app.get("/api/recommendations/:lat/:lng", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lng = parseFloat(req.params.lng);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      const recommendations = await storage.getAIRecommendations(lat, lng);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Update shelter occupancy
  app.patch("/api/shelters/:id/occupancy", async (req, res) => {
    try {
      const { occupancy } = req.body;
      
      if (typeof occupancy !== 'number' || occupancy < 0) {
        return res.status(400).json({ message: "Invalid occupancy value" });
      }

      const shelter = await storage.updateShelterOccupancy(req.params.id, occupancy);
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found" });
      }

      res.json(shelter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shelter occupancy" });
    }
  });

  // Create new shelter
  app.post("/api/shelters", async (req, res) => {
    try {
      const validatedData = insertShelterSchema.parse(req.body);
      const shelter = await storage.createShelter(validatedData);
      res.status(201).json(shelter);
    } catch (error) {
      res.status(400).json({ message: "Invalid shelter data" });
    }
  });

  // Get weather data
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const weather = await storage.getWeatherData(req.params.location);
      if (!weather) {
        return res.status(404).json({ message: "Weather data not found" });
      }
      res.json(weather);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Update weather data
  app.post("/api/weather", async (req, res) => {
    try {
      const validatedData = insertWeatherSchema.parse(req.body);
      const weather = await storage.updateWeatherData(validatedData);
      res.json(weather);
    } catch (error) {
      res.status(400).json({ message: "Invalid weather data" });
    }
  });

  // Get user favorites
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.params.userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:userId/:shelterId", async (req, res) => {
    try {
      const success = await storage.removeFavorite(req.params.userId, req.params.shelterId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
