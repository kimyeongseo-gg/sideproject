import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InteractiveMap } from '@/components/map/interactive-map';
import { ShelterList } from '@/components/shelter/shelter-list';
import { AIRecommendations } from '@/components/shelter/ai-recommendations';
import { ShelterService, type UserLocation } from '@/lib/shelter-service';
import { useToast } from '@/hooks/use-toast';
import type { ShelterWithDistance, AIRecommendation, WeatherData } from '@shared/schema';

const MOCK_USER_ID = 'user-123'; // In a real app, this would come from authentication

export default function ShelterMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedShelterId, setSelectedShelterId] = useState<string | undefined>();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user location on mount
  useEffect(() => {
    ShelterService.getCurrentLocation()
      .then(setUserLocation)
      .catch((error) => {
        console.error('Failed to get user location:', error);
        toast({
          title: "위치 정보를 가져올 수 없습니다",
          description: "기본 위치(서울 강남구)를 사용합니다.",
          variant: "destructive",
        });
      });
  }, [toast]);

  // Fetch nearby shelters
  const { 
    data: shelters = [], 
    isLoading: sheltersLoading,
    error: sheltersError 
  } = useQuery({
    queryKey: ['shelters', 'nearby', userLocation?.latitude, userLocation?.longitude],
    queryFn: () => userLocation ? ShelterService.getNearbyShelters(userLocation) : Promise.resolve([]),
    enabled: !!userLocation,
  });

  // Fetch AI recommendations
  const { 
    data: recommendations = [], 
    isLoading: recommendationsLoading 
  } = useQuery({
    queryKey: ['recommendations', userLocation?.latitude, userLocation?.longitude],
    queryFn: () => userLocation ? ShelterService.getAIRecommendations(userLocation) : Promise.resolve([]),
    enabled: !!userLocation,
  });

  // Fetch weather data
  const { data: weather } = useQuery({
    queryKey: ['weather', '서울시 강남구'],
    queryFn: () => ShelterService.getWeatherData('서울시 강남구'),
  });

  // Favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: (shelterId: string) => ShelterService.addToFavorites(MOCK_USER_ID, shelterId),
    onSuccess: (_, shelterId) => {
      setFavorites(prev => new Set([...prev, shelterId]));
      toast({
        title: "즐겨찾기에 추가됨",
        description: "쉼터가 즐겨찾기에 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "즐겨찾기 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (shelterId: string) => ShelterService.removeFromFavorites(MOCK_USER_ID, shelterId),
    onSuccess: (_, shelterId) => {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(shelterId);
        return newFavorites;
      });
      toast({
        title: "즐겨찾기에서 제거됨",
        description: "쉼터가 즐겨찾기에서 제거되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "즐겨찾기 제거에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (shelterId: string, isFavorite: boolean) => {
    if (isFavorite) {
      addFavoriteMutation.mutate(shelterId);
    } else {
      removeFavoriteMutation.mutate(shelterId);
    }
  };

  const handleShelterClick = (shelterId: string) => {
    setSelectedShelterId(shelterId);
  };

  if (sheltersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-heat-primary text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-900 mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600">네트워크 연결을 확인하고 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-heat-primary" data-testid="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🌞</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI 쉼터 찾기</h1>
                <p className="text-sm text-gray-600">무더위 대피 서비스</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Weather Info */}
              {weather && (
                <div 
                  className="flex items-center space-x-2 heat-wave text-white px-4 py-2 rounded-full"
                  data-testid="weather-info"
                >
                  <i className="fas fa-thermometer-half"></i>
                  <span className="font-semibold">{weather.temperature}°C</span>
                  <span className="text-sm opacity-90">{weather.weatherAlert}</span>
                </div>
              )}
              
              {/* User Location */}
              <div className="flex items-center space-x-2 text-gray-700" data-testid="user-location">
                <i className="fas fa-map-marker-alt text-heat-primary"></i>
                <span>서울시 강남구</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-88px)]">
        {/* Map Section - 50% */}
        {userLocation ? (
          <InteractiveMap
            userLocation={userLocation}
            shelters={shelters}
            selectedShelterId={selectedShelterId}
            onShelterClick={handleShelterClick}
            className="w-1/2"
          />
        ) : (
          <div className="w-1/2 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heat-primary mx-auto mb-4"></div>
              <p className="text-gray-600">위치 정보를 가져오는 중...</p>
            </div>
          </div>
        )}

        {/* Shelter List Section - 50% */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* AI Recommendations */}
          <AIRecommendations
            recommendations={recommendations}
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
            onShelterClick={handleShelterClick}
            isLoading={recommendationsLoading}
          />

          {/* Shelter List */}
          <ShelterList
            shelters={shelters}
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
            onShelterClick={handleShelterClick}
            selectedShelterId={selectedShelterId}
            isLoading={sheltersLoading}
          />
        </div>
      </main>
    </div>
  );
}
