const axios = require('axios');

/**
 * Dynamic geocoding service using OpenStreetMap Nominatim API.
 * Replaces the static places dataset to support any global destination.
 */

// Cache to avoid hitting OSM for the same place multiple times during a session
const geocodeCache = new Map();

/**
 * Fetch coordinates for a given place name and destination using OSM Nominatim.
 * Nominatim requires a User-Agent header and has rate limits (1 request/sec ideally).
 */
async function geocodePlace(placeName, destination) {
  const query = `${placeName}, ${destination}`;
  
  if (geocodeCache.has(query)) {
    return geocodeCache.get(query);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1,
      },
      headers: {
        // Nominatim strict requirement for free usage
        'User-Agent': 'TravelMindApp/1.0 (hackathon-demo)',
      },
    });

    if (response.data && response.data.length > 0) {
      const result = {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
      geocodeCache.set(query, result);
      return result;
    }
    // No global fallback. If it's not found in the destination, returning null is safer 
    // than showing a map marker in the wrong country.
    geocodeCache.set(query, null);
    return null;
  } catch (error) {
    console.error(`Geocoding failed for ${query}:`, error.message);
    return null;
  }
}

/**
 * Delay function to respect Nominatim rate limits (1 req/sec)
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Geocode an array of places sequentially to respect OSM rate limits.
 */
async function geocodePlacesList(places, destination) {
  const geocodedPlaces = [];
  for (const place of places) {
    const coords = await geocodePlace(place.name, destination);
    geocodedPlaces.push({
      ...place,
      coordinates: coords,
    });
    // Sleep to respect Nominatim 1 request per second policy
    await sleep(1000);
  }
  return geocodedPlaces;
}

module.exports = { geocodePlace, geocodePlacesList };
