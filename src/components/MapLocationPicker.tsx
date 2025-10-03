import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, X } from "lucide-react";

interface MapLocationPickerProps {
  onLocationSelect: (location: string, coordinates?: { lat: number; lng: number }) => void;
  initialLocation?: string;
  placeholder?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapLocationPicker = ({ onLocationSelect, initialLocation = "", placeholder = "Search for location..." }: MapLocationPickerProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (isMapOpen && !window.google) {
      loadGoogleMapsScript();
    } else if (isMapOpen && window.google) {
      initializeMap();
    }
  }, [isMapOpen]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default to a central location
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    markerInstance.current = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapInstance.current,
      draggable: true,
    });

    // Add click listener to map
    mapInstance.current.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      markerInstance.current.setPosition({ lat, lng });
      
      // Reverse geocoding to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setSearchValue(address);
          setSelectedLocation(address);
        }
      });
    });

    // Add drag listener to marker
    markerInstance.current.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setSearchValue(address);
          setSelectedLocation(address);
        }
      });
    });

    // Initialize autocomplete
    const searchInput = document.getElementById('map-search-input') as HTMLInputElement;
    if (searchInput) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInput);
      
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          mapInstance.current.setCenter({ lat, lng });
          markerInstance.current.setPosition({ lat, lng });
          
          setSearchValue(place.formatted_address || place.name);
          setSelectedLocation(place.formatted_address || place.name);
        }
      });
    }

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance.current.setCenter(userLocation);
          markerInstance.current.setPosition(userLocation);
        },
        () => {
          // Geolocation failed, keep default location
        }
      );
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
                    id="map-search-input"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search for a location..."
                    className="pl-10"
                  />
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

export default MapLocationPicker;