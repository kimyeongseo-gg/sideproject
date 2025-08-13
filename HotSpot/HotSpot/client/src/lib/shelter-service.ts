import { apiRequest } from "./queryClient";
import type { Shelter, ShelterWithDistance, AIRecommendation, WeatherData } from "@shared/schema";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export class ShelterService {
  static async getShelters(): Promise<Shelter[]> {
    const response = await apiRequest("GET", "/api/shelters");
    return response.json();
  }

  static async getNearbyShelters(location: UserLocation): Promise<ShelterWithDistance[]> {
    const response = await apiRequest("GET", `/api/shelters/nearby/${location.latitude}/${location.longitude}`);
    return response.json();
  }

  static async getAIRecommendations(location: UserLocation): Promise<AIRecommendation[]> {
    const response = await apiRequest("GET", `/api/recommendations/${location.latitude}/${location.longitude}`);
    return response.json();
  }

  static async getShelterById(id: string): Promise<Shelter> {
    const response = await apiRequest("GET", `/api/shelters/${id}`);
    return response.json();
  }

  static async getWeatherData(location: string): Promise<WeatherData> {
    const response = await apiRequest("GET", `/api/weather/${encodeURIComponent(location)}`);
    return response.json();
  }

  static async addToFavorites(userId: string, shelterId: string): Promise<void> {
    await apiRequest("POST", "/api/favorites", {
      userId,
      shelterId,
    });
  }

  static async removeFromFavorites(userId: string, shelterId: string): Promise<void> {
    await apiRequest("DELETE", `/api/favorites/${userId}/${shelterId}`);
  }

  static getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Fallback to Seoul Gangnam-gu coordinates
          const fallbackLocation = {
            latitude: 37.5172,
            longitude: 127.0473,
          };
          
          console.warn("Geolocation failed, using fallback location:", error.message);
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }
}
