const MAPMYINDIA_API_KEY = import.meta.env.VITE_MAPMYINDIA_API_KEY;

export interface DistanceResult {
  distance: number; // in kilometers
  duration: string; // formatted duration
  success: boolean;
  error?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export const calculateDistance = async (
  origin: string, 
  destination: string
): Promise<DistanceResult> => {
  if (!MAPMYINDIA_API_KEY) {
    console.warn('MapmyIndia API key not configured');
    return {
      distance: Math.floor(Math.random() * 50) + 5,
      duration: '30-45 mins',
      success: false,
      error: 'API key not configured'
    };
  }

  try {
    // First geocode the addresses to get coordinates
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);
    
    if (!originCoords || !destCoords) {
      throw new Error('Unable to geocode addresses');
    }

    // Calculate distance using MapmyIndia Distance Matrix API
    const url = `https://apis.mapmyindia.com/advancedmaps/v1/${MAPMYINDIA_API_KEY}/distance_matrix/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?rtype=1&region=ind`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseCode === 200 && data.results?.distances?.[0]?.[1]) {
      const distanceInMeters = data.results.distances[0][1];
      const durationInSeconds = data.results.durations[0][1];
      
      const distanceInKm = Math.round(distanceInMeters / 1000);
      const durationInMins = Math.round(durationInSeconds / 60);
      
      return {
        distance: distanceInKm,
        duration: `${durationInMins} mins`,
        success: true
      };
    } else {
      throw new Error(`API Error: ${data.responseCode} - ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      distance: Math.floor(Math.random() * 50) + 5,
      duration: '30-45 mins',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!MAPMYINDIA_API_KEY) {
    return null;
  }

  try {
    const url = `https://atlas.mapmyindia.com/api/places/geocode?address=${encodeURIComponent(address)}&itemCount=1`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${MAPMYINDIA_API_KEY}`
      }
    });
    
    const data = await response.json();
    
    if (data.copResults?.[0]) {
      const result = data.copResults[0];
      return {
        lat: parseFloat(result.latitude || result.lat),
        lng: parseFloat(result.longitude || result.lng)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  if (!MAPMYINDIA_API_KEY) {
    return null;
  }

  try {
    const url = `https://atlas.mapmyindia.com/api/places/reverse_geocode?lat=${lat}&lng=${lng}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${MAPMYINDIA_API_KEY}`
      }
    });
    
    const data = await response.json();
    
    if (data.results?.[0]) {
      return data.results[0].formatted_address;
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};