import { type Shelter, type InsertShelter, type WeatherData, type InsertWeatherData, type UserFavorite, type InsertUserFavorite, type ShelterWithDistance, type AIRecommendation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Shelter operations
  getShelters(): Promise<Shelter[]>;
  getShelterById(id: string): Promise<Shelter | undefined>;
  createShelter(shelter: InsertShelter): Promise<Shelter>;
  updateShelterOccupancy(id: string, occupancy: number): Promise<Shelter | undefined>;
  
  // Weather operations
  getWeatherData(location: string): Promise<WeatherData | undefined>;
  updateWeatherData(weather: InsertWeatherData): Promise<WeatherData>;
  
  // Favorites operations
  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFavorite(userId: string, shelterId: string): Promise<boolean>;
  
  // AI recommendation operations
  getSheltersWithDistance(userLat: number, userLng: number): Promise<ShelterWithDistance[]>;
  getAIRecommendations(userLat: number, userLng: number): Promise<AIRecommendation[]>;
}

export class MemStorage implements IStorage {
  private shelters: Map<string, Shelter>;
  private weatherData: Map<string, WeatherData>;
  private favorites: Map<string, UserFavorite>;

  constructor() {
    this.shelters = new Map();
    this.weatherData = new Map();
    this.favorites = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample shelters
    const sampleShelters: InsertShelter[] = [
      {
        name: "강남구청 대피소",
        address: "서울시 강남구 학동로 426",
        latitude: "37.5172",
        longitude: "127.0473",
        type: "public",
        occupancyLevel: "high",
        currentOccupancy: 85,
        maxCapacity: 100,
        operatingHours: "24시간",
        rating: "4.2",
        amenities: ["wifi", "free"],
        description: "대형 냉방시설과 휴게공간을 갖춘 공공 대피소입니다.",
        isActive: true,
      },
      {
        name: "선릉역 냉방시설",
        address: "서울시 강남구 선릉로 지하",
        latitude: "37.5044",
        longitude: "127.0489",
        type: "transport",
        occupancyLevel: "medium",
        currentOccupancy: 45,
        maxCapacity: 80,
        operatingHours: "06:00-22:00",
        rating: "4.5",
        amenities: ["free", "convenience_store"],
        description: "지하철역 내부 대합실로 24시간 이용 가능한 쉼터입니다.",
        isActive: true,
      },
      {
        name: "대치문화센터",
        address: "서울시 강남구 대치동",
        latitude: "37.4946",
        longitude: "127.0631",
        type: "public",
        occupancyLevel: "low",
        currentOccupancy: 15,
        maxCapacity: 120,
        operatingHours: "09:00-18:00",
        rating: "4.7",
        amenities: ["wifi", "free", "cafe", "quiet"],
        description: "쾌적한 환경과 다양한 편의시설을 갖춘 문화센터입니다.",
        isActive: true,
      },
      {
        name: "역삼동 주민센터",
        address: "서울시 강남구 역삼동",
        latitude: "37.5001",
        longitude: "127.0374",
        type: "public",
        occupancyLevel: "low",
        currentOccupancy: 20,
        maxCapacity: 60,
        operatingHours: "24시간",
        rating: "4.3",
        amenities: ["wifi", "free"],
        description: "24시간 운영하는 주민센터 냉방 쉼터입니다.",
        isActive: true,
      },
      {
        name: "코엑스몰",
        address: "서울시 강남구 영동대로 513",
        latitude: "37.5115",
        longitude: "127.0595",
        type: "commercial",
        occupancyLevel: "medium",
        currentOccupancy: 150,
        maxCapacity: 300,
        operatingHours: "10:00-22:00",
        rating: "4.1",
        amenities: ["parking", "restaurants", "shopping"],
        description: "대형 쇼핑몰로 다양한 편의시설과 식음료를 이용할 수 있습니다.",
        isActive: true,
      }
    ];

    sampleShelters.forEach(shelter => {
      const id = randomUUID();
      const fullShelter: Shelter = {
        ...shelter,
        id,
        lastUpdated: new Date(),
      };
      this.shelters.set(id, fullShelter);
    });

    // Sample weather data
    const weather: WeatherData = {
      id: randomUUID(),
      location: "서울시 강남구",
      temperature: "35.0",
      heatIndex: "38.0",
      weatherAlert: "폭염주의보",
      updatedAt: new Date(),
    };
    this.weatherData.set(weather.location, weather);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateRecommendationScore(shelter: ShelterWithDistance): number {
    let score = 100;
    
    // Distance factor (closer is better)
    score -= shelter.distance * 10;
    
    // Occupancy factor (less crowded is better)
    const occupancyRate = shelter.currentOccupancy / shelter.maxCapacity;
    if (shelter.occupancyLevel === 'low') score += 20;
    else if (shelter.occupancyLevel === 'medium') score += 10;
    else score -= 10;
    
    // Rating factor
    score += parseFloat(shelter.rating) * 5;
    
    // Operating hours factor (24h is better)
    if (shelter.operatingHours.includes('24')) score += 15;
    
    // Amenities factor
    score += shelter.amenities.length * 3;
    
    return Math.max(0, score);
  }

  async getShelters(): Promise<Shelter[]> {
    return Array.from(this.shelters.values());
  }

  async getShelterById(id: string): Promise<Shelter | undefined> {
    return this.shelters.get(id);
  }

  async createShelter(insertShelter: InsertShelter): Promise<Shelter> {
    const id = randomUUID();
    const shelter: Shelter = {
      ...insertShelter,
      id,
      lastUpdated: new Date(),
    };
    this.shelters.set(id, shelter);
    return shelter;
  }

  async updateShelterOccupancy(id: string, occupancy: number): Promise<Shelter | undefined> {
    const shelter = this.shelters.get(id);
    if (!shelter) return undefined;

    const occupancyRate = occupancy / shelter.maxCapacity;
    let level: 'low' | 'medium' | 'high' = 'low';
    
    if (occupancyRate > 0.7) level = 'high';
    else if (occupancyRate > 0.4) level = 'medium';

    const updatedShelter: Shelter = {
      ...shelter,
      currentOccupancy: occupancy,
      occupancyLevel: level,
      lastUpdated: new Date(),
    };

    this.shelters.set(id, updatedShelter);
    return updatedShelter;
  }

  async getWeatherData(location: string): Promise<WeatherData | undefined> {
    return this.weatherData.get(location);
  }

  async updateWeatherData(weather: InsertWeatherData): Promise<WeatherData> {
    const id = randomUUID();
    const weatherRecord: WeatherData = {
      ...weather,
      id,
      updatedAt: new Date(),
    };
    this.weatherData.set(weather.location, weatherRecord);
    return weatherRecord;
  }

  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return Array.from(this.favorites.values()).filter(fav => fav.userId === userId);
  }

  async addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const id = randomUUID();
    const newFavorite: UserFavorite = {
      ...favorite,
      id,
      createdAt: new Date(),
    };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: string, shelterId: string): Promise<boolean> {
    for (const [id, favorite] of this.favorites.entries()) {
      if (favorite.userId === userId && favorite.shelterId === shelterId) {
        this.favorites.delete(id);
        return true;
      }
    }
    return false;
  }

  async getSheltersWithDistance(userLat: number, userLng: number): Promise<ShelterWithDistance[]> {
    const shelters = await this.getShelters();
    return shelters.map(shelter => ({
      ...shelter,
      distance: this.calculateDistance(
        userLat, userLng,
        parseFloat(shelter.latitude), parseFloat(shelter.longitude)
      )
    }));
  }

  async getAIRecommendations(userLat: number, userLng: number): Promise<AIRecommendation[]> {
    const sheltersWithDistance = await this.getSheltersWithDistance(userLat, userLng);
    
    const scored = sheltersWithDistance.map(shelter => ({
      ...shelter,
      recommendationScore: this.calculateRecommendationScore(shelter)
    }));

    const sorted = scored.sort((a, b) => b.recommendationScore! - a.recommendationScore!);
    
    const top3 = sorted.slice(0, 3);
    
    return top3.map((shelter, index) => ({
      shelter,
      rank: index + 1,
      reason: this.generateRecommendationReason(shelter, index + 1)
    }));
  }

  private generateRecommendationReason(shelter: ShelterWithDistance, rank: number): string {
    const reasons = [];
    
    if (shelter.distance < 1) reasons.push("가까운 거리");
    if (shelter.occupancyLevel === 'low') reasons.push("여유로운 공간");
    if (shelter.operatingHours.includes('24')) reasons.push("24시간 이용가능");
    if (parseFloat(shelter.rating) > 4.5) reasons.push("높은 만족도");
    if (shelter.amenities.includes('wifi')) reasons.push("Wi-Fi 제공");
    if (shelter.amenities.includes('free')) reasons.push("무료 이용");

    return reasons.slice(0, 3).join(", ");
  }
}

export const storage = new MemStorage();
