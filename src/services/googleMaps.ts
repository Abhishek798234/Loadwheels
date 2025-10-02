const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface DistanceResult {
  distance: number; // in kilometers
  duration: string; // formatted duration
  success: boolean;
  error?: string;
}

export const calculateDistance = async (
  origin: string, 
  destination: string
): Promise<DistanceResult> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return {
      distance: Math.floor(Math.random() * 50) + 5,
      duration: '30-45 mins',
      success: false,
      error: 'API key not configured'
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${encodeURIComponent(origin)}&` +
      `destinations=${encodeURIComponent(destination)}&` +
      `units=metric&` +
      `mode=driving&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      const distanceInKm = Math.round(element.distance.value / 1000);
      const duration = element.duration.text;

      return {
        distance: distanceInKm,
        duration,
        success: true
      };
    } else {
      throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
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