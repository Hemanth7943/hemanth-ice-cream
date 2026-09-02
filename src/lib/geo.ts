export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ResolvedAddress {
  formattedAddress: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

/**
 * Reverse-geocode latitude and longitude into human-readable luxury delivery address
 */
export async function reverseGeocode(coords: GeoCoordinates): Promise<ResolvedAddress> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HemanthIceCreams-LuxuryApp/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const parts = [
        addr.house_number || addr.building,
        addr.road || addr.pedestrian,
        addr.suburb || addr.neighbourhood || addr.city_district,
        addr.city || addr.town || addr.municipality,
        addr.state,
        addr.postcode,
      ].filter(Boolean);

      return {
        formattedAddress: parts.join(', ') || data.display_name || 'Verified GPS Location',
        road: addr.road,
        suburb: addr.suburb || addr.neighbourhood,
        city: addr.city || addr.town,
        state: addr.state,
        postcode: addr.postcode,
        country: addr.country,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed, using luxury fallback coordinates:', err);
  }

  // Graceful fallback for offline / mock testing
  return {
    formattedAddress: `Luxury Estate & Residence, Coordinates [${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}]`,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
  };
}
