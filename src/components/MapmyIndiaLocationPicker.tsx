import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, X } from "lucide-react";
import { geocodeAddress, reverseGeocode } from "@/services/mapmyindia";

interface MapLocationPickerProps {
  onLocationSelect: (location: string, coordinates?: { lat: number; lng: number }) => void;
  initialLocation?: string;
  placeholder?: string;
}

declare global {
  interface Window {
    MapmyIndia: any;
  }
}

const MapmyIndiaLocationPicker = ({ onLocationSelect, initialLocation = "", placeholder = "Search for location..." }: MapLocationPickerProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    if (isMapOpen && !window.MapmyIndia) {
      loadMapmyIndiaScript();
    } else if (isMapOpen && window.MapmyIndia) {
      initializeMap();
    }
  }, [isMapOpen]);

  const loadMapmyIndiaScript = () => {
    if (document.querySelector('script[src*="mapmyindia.com"]')) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://apis.mapmyindia.com/advancedmaps/api/${import.meta.env.VITE_MAPMYINDIA_API_KEY}/map_sdk?layer=vector&v=3.0&callback=initMapmyIndia`;
    script.async = true;
    script.defer = true;
    
    window.initMapmyIndia = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.MapmyIndia) return;

    // Default to Delhi coordinates
    const defaultLocation = { lat: 28.7041, lng: 77.1025 };

    mapInstance.current = new window.MapmyIndia.Map(mapRef.current, {
      center: [defaultLocation.lat, defaultLocation.lng],
      zoom: 12,
      zoomControl: true,
      location: true
    });

    // Add marker
    markerInstance.current = new window.MapmyIndia.Marker({
      map: mapInstance.current,
      position: [defaultLocation.lat, defaultLocation.lng],
      draggable: true
    });

    // Add click listener to map
    mapInstance.current.addListener('click', async (event: any) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      
      markerInstance.current.setPosition([lat, lng]);
      
      // Reverse geocoding to get address
      const address = await reverseGeocode(lat, lng);
      if (address) {
        setSearchValue(address);
        setSelectedLocation(address);
      }
    });

    // Add drag listener to marker
    markerInstance.current.addListener('dragend', async (event: any) => {
      const lat = event.target.getPosition().lat;
      const lng = event.target.getPosition().lng;
      
      const address = await reverseGeocode(lat, lng);
      if (address) {
        setSearchValue(address);
        setSelectedLocation(address);
      }
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];
          mapInstance.current.setCenter(userLocation);
          markerInstance.current.setPosition(userLocation);
        },
        () => {
          // Geolocation failed, keep default location
        }
      );
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      // Use MapmyIndia Autosuggest API
      const response = await fetch(
        `https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_MAPMYINDIA_API_KEY}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.suggestedLocations) {
        setSearchResults(data.suggestedLocations.slice(0, 5));
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSearchResultSelect = async (result: any) => {
    const coords = await geocodeAddress(result.placeName);
    if (coords && mapInstance.current) {
      mapInstance.current.setCenter([coords.lat, coords.lng]);
      markerInstance.current.setPosition([coords.lat, coords.lng]);
      setSearchValue(result.placeName);
      setSelectedLocation(result.placeName);
      setSearchResults([]);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      setIsMapOpen(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (!isMapOpen) {
      onLocationSelect(value);
    } else {
      handleSearch(value);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsMapOpen(true)}
          className="px-3"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {isMapOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl h-[600px] flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Location</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMapOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search for a location in India..."
                    className="pl-10"
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          <div className="font-medium">{result.placeName}</div>
                          <div className="text-sm text-gray-600">{result.placeAddress}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div ref={mapRef} className="flex-1 rounded-lg border" />

              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Click on the map or drag the marker to select a location
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsMapOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmLocation}
                    disabled={!selectedLocation}
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapmyIndiaLocationPicker;