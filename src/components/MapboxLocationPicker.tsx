import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { searchPlaces, reverseGeocode, type Location } from '../services/mapbox';
import { Search, MapPin } from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  placeholder?: string;
}

export const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for a location..."
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation ? [initialLocation.lng, initialLocation.lat] : [77.2090, 28.6139], // Delhi
      zoom: 12
    });

    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      const address = await reverseGeocode(lat, lng);
      const location = { lat, lng, address };
      
      setSelectedLocation(location);
      onLocationSelect(location);
      updateMarker(location);
    });

    // Auto-get user location on load if no initial location
    map.current.on('load', () => {
      if (!initialLocation) {
        getCurrentLocation();
      }
    });

    if (initialLocation) {
      updateMarker(initialLocation);
    }
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const address = await reverseGeocode(lat, lng);
          const location = { lat, lng, address };
          
          setSelectedLocation(location);
          setSearchQuery(address);
          onLocationSelect(location);
          updateMarker(location);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  };

  const updateMarker = (location: Location) => {
    if (marker.current) {
      marker.current.remove();
    }

    marker.current = new mapboxgl.Marker()
      .setLngLat([location.lng, location.lat])
      .addTo(map.current!);

    map.current!.flyTo({
      center: [location.lng, location.lat],
      zoom: 15
    });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchPlaces(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectSearchResult = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery(location.address || '');
    setShowResults(false);
    onLocationSelect(location);
    updateMarker(location);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
          <button
            onClick={getCurrentLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
            title="Get my location"
          >
            📍
          </button>

        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-black">{result.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg border border-gray-300"
      />

      {selectedLocation && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};