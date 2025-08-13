import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShelterCard } from './shelter-card';
import type { ShelterWithDistance } from '@shared/schema';

interface ShelterListProps {
  shelters: ShelterWithDistance[];
  favorites: Set<string>;
  onFavoriteToggle: (shelterId: string, isFavorite: boolean) => void;
  onShelterClick: (shelterId: string) => void;
  selectedShelterId?: string;
  isLoading?: boolean;
}

type SortBy = 'distance' | 'occupancy' | 'rating' | 'name';

export function ShelterList({ 
  shelters, 
  favorites,
  onFavoriteToggle, 
  onShelterClick,
  selectedShelterId,
  isLoading = false 
}: ShelterListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredShelters, setFilteredShelters] = useState<ShelterWithDistance[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter and sort shelters
  useEffect(() => {
    let filtered = shelters.filter(shelter =>
      shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort shelters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'occupancy':
          const occupancyOrder = { low: 1, medium: 2, high: 3 };
          return occupancyOrder[a.occupancyLevel as keyof typeof occupancyOrder] - 
                 occupancyOrder[b.occupancyLevel as keyof typeof occupancyOrder];
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'name':
          return a.name.localeCompare(b.name, 'ko');
        default:
          return 0;
      }
    });

    setFilteredShelters(filtered);
  }, [shelters, searchQuery, sortBy]);

  // Scroll to selected shelter
  useEffect(() => {
    if (selectedShelterId && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-testid="shelter-card-${selectedShelterId}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [selectedShelterId]);

  const getSortLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      distance: '거리순',
      occupancy: '혼잡도순',
      rating: '평점순',
      name: '이름순',
    };
    return labels[value] || value;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-5 bg-gray-200 rounded"></div>
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="flex space-x-4 mb-3">
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex space-x-2 mb-2">
                <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-5 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" data-testid="shelter-list">
      {/* List Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">전체 쉼터 목록</h3>
          <span 
            className="text-sm text-gray-500 bg-white px-2 py-1 rounded"
            data-testid="shelter-count"
          >
            총 <span>{filteredShelters.length}</span>개
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-32" data-testid="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">{getSortLabel('distance')}</SelectItem>
              <SelectItem value="occupancy">{getSortLabel('occupancy')}</SelectItem>
              <SelectItem value="rating">{getSortLabel('rating')}</SelectItem>
              <SelectItem value="name">{getSortLabel('name')}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="쉼터 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 pr-8"
              data-testid="search-input"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto text-gray-400 hover:text-heat-primary"
              data-testid="search-button"
            >
              <i className="fas fa-search text-xs"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Shelter List */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
        data-testid="shelter-list-container"
      >
        {filteredShelters.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-8 text-center">
              <i className="fas fa-search text-gray-400 text-3xl mb-4"></i>
              <h4 className="font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h4>
              <p className="text-gray-600">
                {searchQuery ? 
                  `"${searchQuery}"에 대한 검색 결과가 없습니다. 다른 키워드로 검색해보세요.` :
                  '현재 이용 가능한 쉼터가 없습니다.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredShelters.map((shelter) => (
            <ShelterCard
              key={shelter.id}
              shelter={shelter}
              isFavorite={favorites.has(shelter.id)}
              onFavoriteToggle={onFavoriteToggle}
              onClick={() => onShelterClick(shelter.id)}
              isHighlighted={selectedShelterId === shelter.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
