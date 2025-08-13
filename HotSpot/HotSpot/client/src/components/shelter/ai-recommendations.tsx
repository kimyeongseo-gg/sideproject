import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShelterCard } from './shelter-card';
import type { AIRecommendation } from '@shared/schema';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  favorites: Set<string>;
  onFavoriteToggle: (shelterId: string, isFavorite: boolean) => void;
  onShelterClick: (shelterId: string) => void;
  isLoading?: boolean;
}

export function AIRecommendations({ 
  recommendations, 
  favorites,
  onFavoriteToggle, 
  onShelterClick,
  isLoading = false 
}: AIRecommendationsProps) {
  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-heat-primary rounded-full flex items-center justify-center">
            <i className="fas fa-brain text-white text-sm"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900">AI 추천 쉼터 TOP 3</h2>
          <span className="text-2xl">🌟</span>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
              <div className="flex space-x-4 mb-2">
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-heat-primary rounded-full flex items-center justify-center">
            <i className="fas fa-brain text-white text-sm"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900">AI 추천 쉼터 TOP 3</h2>
          <span className="text-2xl">🌟</span>
        </div>
        
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <i className="fas fa-exclamation-circle text-gray-400 text-2xl mb-2"></i>
            <p className="text-gray-600">위치 정보를 가져오는 중이거나 추천할 수 있는 쉼터가 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-red-50" data-testid="ai-recommendations">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-heat-primary rounded-full flex items-center justify-center">
          <i className="fas fa-brain text-white text-sm"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-900">AI 추천 쉼터 TOP 3</h2>
        <span className="text-2xl">🌟</span>
      </div>
      
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <Card 
            key={recommendation.shelter.id} 
            className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onShelterClick(recommendation.shelter.id)}
            data-testid={`recommendation-${recommendation.rank}`}
          >
            <CardContent className="p-4">
              {/* Rank Badge */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span 
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${getRankBadgeClass(recommendation.rank)}`}
                    data-testid={`rank-badge-${recommendation.rank}`}
                  >
                    {recommendation.rank}순위
                  </span>
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      recommendation.shelter.occupancyLevel === 'low' ? 'bg-occupancy-low' :
                      recommendation.shelter.occupancyLevel === 'medium' ? 'bg-occupancy-medium' : 'bg-occupancy-high'
                    }`}
                    data-testid="recommendation-occupancy-indicator"
                  />
                </div>
                <button 
                  className={`transition-colors ${
                    favorites.has(recommendation.shelter.id) ? 'text-heat-primary' : 'text-gray-400 hover:text-heat-primary'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteToggle(recommendation.shelter.id, !favorites.has(recommendation.shelter.id));
                  }}
                  data-testid="recommendation-favorite-button"
                >
                  <i className={favorites.has(recommendation.shelter.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>

              {/* Shelter Info */}
              <h3 className="font-bold text-gray-900 mb-1" data-testid="recommendation-name">
                {recommendation.shelter.name}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span data-testid="recommendation-distance">
                  <i className="fas fa-walking mr-1 text-heat-primary"></i>
                  {recommendation.shelter.distance.toFixed(1)}km
                </span>
                <span data-testid="recommendation-hours">
                  <i className="fas fa-clock mr-1 text-heat-primary"></i>
                  {recommendation.shelter.operatingHours}
                </span>
                <span 
                  className={`font-medium ${
                    recommendation.shelter.occupancyLevel === 'low' ? 'text-occupancy-low' :
                    recommendation.shelter.occupancyLevel === 'medium' ? 'text-occupancy-medium' : 'text-occupancy-high'
                  }`}
                  data-testid="recommendation-occupancy-text"
                >
                  {
                    {
                      low: '여유함',
                      medium: '보통',
                      high: '혼잡',
                    }[recommendation.shelter.occupancyLevel] || recommendation.shelter.occupancyLevel
                  }
                </span>
              </div>
              
              {/* AI Reason */}
              <div className="text-xs text-gray-500" data-testid="recommendation-reason">
                <span className="font-medium">AI 추천 이유:</span> {recommendation.reason}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
