import axios from 'axios';

// Cache to prevent duplicate API calls and getting rate limited by Nominatim
const geocodeCache = {};

export const geocodeAddress = async (address) => {
  if (!address) return null;
  
  if (geocodeCache[address]) {
    return geocodeCache[address];
  }

  try {
    // Nominatim OpenStreetMap API requires a User-Agent or specific query params. Always be polite!
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1
      }
    });

    if (res.data && res.data.length > 0) {
      const coords = {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon)
      };
      geocodeCache[address] = coords;
      return coords;
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
