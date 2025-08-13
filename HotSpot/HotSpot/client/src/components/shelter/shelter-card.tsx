import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ShelterWithDistance } from '@shared/schema';

interface ShelterCardProps {
  shelter: ShelterWithDistance;
  isFavorite?: boolean;
  onFavoriteToggle?: (shelterId: string, isFavorite: boolean) => void;
  onClick?: () => void;
  isHighlighted?: boolean;
  className?: string;
}

export function ShelterCard({ 
  shelter, 
  isFavorite = false, 
  onFavoriteToggle, 
  onClick,
  isHighlighted = false,
  className = "" 
}: ShelterCardProps) {
  const occupancyColor = {
    low: 'text-occupancy-low',
    medium: 'text-occupancy-medium',
    high: 'text-occupancy-high',
  }[shelter.occupancyLevel] || 'text-gray-500';

  const occupancyText = {
    low: '여유함',
    medium: '보통',
    high: '혼잡',
  }[shelter.occupancyLevel] || shelter.occupancyLevel;

  const typeText = {
    public: '공공시설',
    commercial: '상업시설',
    religious: '종교시설',
    transport: '교통시설',
  }[shelter.type] || shelter.type;

  const amenityColors: { [key: string]: string } = {
    wifi: 'bg-purple-100 text-purple-800',
    free: 'bg-green-100 text-green-800',
    cafe: 'bg-pink-100 text-pink-800',
    parking: 'bg-blue-100 text-blue-800',
    quiet: 'bg-indigo-100 text-indigo-800',
    convenience_store: 'bg-orange-100 text-orange-800',
    restaurants: 'bg-yellow-100 text-yellow-800',
    shopping: 'bg-purple-100 text-purple-800',
  };

  const amenityLabels: { [key: string]: string } = {
    wifi: 'Wi-Fi',
    free: '무료',
    cafe: '카페',
    parking: '주차',
    quiet: '조용함',
    convenience_store: '편의점',
    restaurants: '식당가',
    shopping: '쇼핑',
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(shelter.id, !isFavorite);
  };

  return (
    <Card 
      className={`shelter-card cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isHighlighted ? 'ring-2 ring-heat-primary bg-orange-50' : ''
      } ${className}`}
      onClick={onClick}
      data-testid={`shelter-card-${shelter.id}`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-gray-900" data-testid="shelter-name">
              {shelter.name}
            </h4>
            <div 
              className={`w-3 h-3 rounded-full ${
                shelter.occupancyLevel === 'low' ? 'bg-occupancy-low' :
                shelter.occupancyLevel === 'medium' ? 'bg-occupancy-medium' : 'bg-occupancy-high'
              }`}
              title={`혼잡도: ${occupancyText}`}
              data-testid="occupancy-indicator"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${isFavorite ? 'text-heat-primary' : 'text-gray-400 hover:text-heat-primary'}`}
            onClick={handleFavoriteClick}
            data-testid="button-favorite-toggle"
          >
            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
          </Button>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <span data-testid="shelter-distance">
            <i className="fas fa-walking mr-1 text-heat-primary"></i>
            {shelter.distance.toFixed(1)}km
          </span>
          <span data-testid="shelter-hours">
            <i className="fas fa-clock mr-1 text-heat-primary"></i>
            {shelter.operatingHours}
          </span>
          <span className={`${occupancyColor} font-medium`} data-testid="shelter-occupancy">
            {occupancyText}
          </span>
          <span data-testid="shelter-rating">
            <i className="fas fa-star mr-1 text-yellow-400"></i>
            {shelter.rating}
          </span>
        </div>
        
        {/* Tags */}
        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800" data-testid="shelter-type">
            {typeText}
          </Badge>
          {shelter.amenities.slice(0, 3).map((amenity) => (
            <Badge 
              key={amenity} 
              variant="secondary"
              className={amenityColors[amenity] || 'bg-gray-100 text-gray-800'}
              data-testid={`amenity-${amenity}`}
            >
              {amenityLabels[amenity] || amenity}
            </Badge>
          ))}
          {shelter.amenities.length > 3 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600" data-testid="amenity-more">
              +{shelter.amenities.length - 3}개
            </Badge>
          )}
        </div>
        
        {/* Description */}
        {shelter.description && (
          <p className="text-xs text-gray-500 line-clamp-2" data-testid="shelter-description">
            {shelter.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
