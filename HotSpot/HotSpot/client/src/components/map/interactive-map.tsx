import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ShelterWithDistance } from '@shared/schema';
import { UserLocation } from '@/lib/shelter-service';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  userLocation: UserLocation;
  shelters: ShelterWithDistance[];
  selectedShelterId?: string;
  onShelterClick: (shelterId: string) => void;
  className?: string;
}

interface OccupancyColors {
  low: string;
  medium: string;
  high: string;
}

const occupancyColors: OccupancyColors = {
  low: '#27AE60',
  medium: '#F1C40F',
  high: '#E74C3C',
};

export function InteractiveMap({ 
  userLocation, 
  shelters, 
  selectedShelterId, 
  onShelterClick,
  className = ""
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [userLocation.latitude, userLocation.longitude],
      zoom: 14,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create custom user location icon
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background-color: #3B82F6; 
          border: 4px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        </style>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: userIcon,
    })
      .addTo(mapInstanceRef.current)
      .bindPopup('<div style="text-align: center; font-weight: 600; color: #1f2937;">현재 위치</div>');

    // Center map on user location
    mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
  }, [userLocation]);

  // Update shelter markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Filter shelters
    const filteredShelters = shelters.filter(shelter => {
      if (filterType === 'all') return true;
      return shelter.type === filterType;
    });

    // Add new markers
    filteredShelters.forEach(shelter => {
      const color = occupancyColors[shelter.occupancyLevel as keyof OccupancyColors];
      
      const shelterIcon = L.divIcon({
        className: 'shelter-marker',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: ${color}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s;
          " 
          onmouseover="this.style.transform='scale(1.2)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.4)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)';"
          ></div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const occupancyText = {
        low: '여유',
        medium: '보통',
        high: '혼잡'
      }[shelter.occupancyLevel] || shelter.occupancyLevel;

      const amenityText = shelter.amenities.map(amenity => {
        const amenityMap: { [key: string]: string } = {
          wifi: 'Wi-Fi',
          free: '무료',
          cafe: '카페',
          parking: '주차',
          quiet: '조용함',
          convenience_store: '편의점',
          restaurants: '식당',
          shopping: '쇼핑',
        };
        return amenityMap[amenity] || amenity;
      }).join(', ');

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <div style="font-weight: 600; font-size: 16px; color: #1f2937; margin-bottom: 8px;">
            ${shelter.name}
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            <i class="fas fa-walking" style="margin-right: 6px; color: #FF6B35;"></i>
            거리: ${shelter.distance.toFixed(1)}km
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            <i class="fas fa-clock" style="margin-right: 6px; color: #FF6B35;"></i>
            ${shelter.operatingHours}
          </div>
          <div style="font-size: 14px; margin-bottom: 8px;">
            혼잡도: <span style="color: ${color}; font-weight: 600;">${occupancyText}</span>
          </div>
          ${amenityText && `
            <div style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
              ${amenityText}
            </div>
          `}
          <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
            ${shelter.description}
          </div>
        </div>
      `;

      const marker = L.marker([parseFloat(shelter.latitude), parseFloat(shelter.longitude)], {
        icon: shelterIcon,
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(popupContent)
        .on('click', () => {
          onShelterClick(shelter.id);
        });

      // Highlight selected marker
      if (selectedShelterId === shelter.id) {
        marker.openPopup();
        // Add a pulsing effect to selected marker
        const markerElement = marker.getElement();
        if (markerElement) {
          markerElement.style.animation = 'pulse 1.5s infinite';
        }
      }

      markersRef.current.set(shelter.id, marker);
    });
  }, [shelters, selectedShelterId, onShelterClick, filterType]);

  // Focus on selected shelter
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedShelterId) return;

    const marker = markersRef.current.get(selectedShelterId);
    if (marker) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.setView(latlng, 16, { animate: true });
      marker.openPopup();
    }
  }, [selectedShelterId]);

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      public: 'building',
      commercial: 'store',
      religious: 'church',
      transport: 'train',
    };
    return icons[type] || 'building';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      public: '공공시설',
      commercial: '상업시설',
      religious: '종교시설',
      transport: '교통시설',
    };
    return labels[type] || type;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Filter Controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2" data-testid="map-filters">
        <button 
          className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 flex items-center space-x-2"
          data-testid="button-filter-toggle"
        >
          <i className="fas fa-filter text-heat-primary"></i>
          <span className="text-sm font-medium">필터</span>
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType(filterType === 'all' ? 'all' : 'all')}
            className={`px-3 py-2 rounded-lg shadow-lg transition-colors border border-gray-200 ${
              filterType === 'all' ? 'bg-heat-primary text-white' : 'bg-white hover:bg-gray-50'
            }`}
            data-testid="button-filter-all"
          >
            <span className="text-xs">전체</span>
          </button>
          
          {['public', 'commercial', 'religious', 'transport'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`px-3 py-2 rounded-lg shadow-lg transition-colors border border-gray-200 ${
                filterType === type ? 'bg-heat-primary text-white' : 'bg-white hover:bg-gray-50'
              }`}
              data-testid={`button-filter-${type}`}
            >
              <i className={`fas fa-${getTypeIcon(type)} ${filterType === type ? 'text-white' : 'text-gray-600'} mr-1`}></i>
              <span className="text-xs">{getTypeLabel(type)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" data-testid="interactive-map" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200" data-testid="map-legend">
        <div className="text-xs font-semibold text-gray-700 mb-2">혼잡도 범례</div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1" data-testid="legend-low">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: occupancyColors.low }}></div>
            <span className="text-xs text-gray-600">여유</span>
          </div>
          <div className="flex items-center space-x-1" data-testid="legend-medium">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: occupancyColors.medium }}></div>
            <span className="text-xs text-gray-600">보통</span>
          </div>
          <div className="flex items-center space-x-1" data-testid="legend-high">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: occupancyColors.high }}></div>
            <span className="text-xs text-gray-600">혼잡</span>
          </div>
        </div>
      </div>
    </div>
  );
}
