const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export const calculateDistance = async (origin: Location, destination: Location): Promise<number> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson`
    );
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return Math.round(data.routes[0].distance / 1000); // Convert to km
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.error('Distance calculation error:', error);
    // Fallback to straight-line distance
    return calculateStraightLineDistance(origin, destination);
  }
};

export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=IN&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return {
        lat,
        lng,
        address: data.features[0].place_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export const searchPlaces = async (query: string): Promise<Location[]> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=IN&limit=5`
    );
    
    const data = await response.json();
    
    return data.features?.map((feature: any) => ({
      lat: feature.center[1],
      lng: feature.center[0],
      address: feature.place_name
    })) || [];
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
};

const calculateStraightLineDistance = (origin: Location, destination: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLng = (destination.lng - origin.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};