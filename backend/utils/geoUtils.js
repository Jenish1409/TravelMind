/**
 * Haversine formula — calculate distance in km between two lat/lng points
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Greedy nearest-neighbour sort — reorders places within a day to minimize travel distance.
 * Starts from the first place with coordinates and picks the nearest unvisited place next.
 */
function sortPlacesByProximity(places) {
    const withCoords = places.filter(p => p.coordinates?.lat && p.coordinates?.lng);
    const withoutCoords = places.filter(p => !p.coordinates?.lat || !p.coordinates?.lng);

    if (withCoords.length <= 1) return places;

    const sorted = [withCoords[0]];
    const unvisited = withCoords.slice(1);

    while (unvisited.length > 0) {
        const last = sorted[sorted.length - 1];
        let minDist = Infinity;
        let nearestIdx = 0;

        unvisited.forEach((place, idx) => {
            const dist = haversineDistance(
                last.coordinates.lat, last.coordinates.lng,
                place.coordinates.lat, place.coordinates.lng
            );
            if (dist < minDist) {
                minDist = dist;
                nearestIdx = idx;
            }
        });

        sorted.push(unvisited[nearestIdx]);
        unvisited.splice(nearestIdx, 1);
    }

    return [...sorted, ...withoutCoords];
}

/**
 * Filter out locations that are too far from the group's center (e.g. > 150km outlier)
 */
function validateCoordinatesWithinRadius(places, maxRadiusKm = 150) {
    const withCoords = places.filter(p => p.coordinates?.lat && p.coordinates?.lng);
    if (withCoords.length === 0) return places;

    // calculate approximate center
    let sumLat = 0, sumLng = 0;
    withCoords.forEach(p => { sumLat += p.coordinates.lat; sumLng += p.coordinates.lng; });
    const centerLat = sumLat / withCoords.length;
    const centerLng = sumLng / withCoords.length;

    return places.filter(p => {
        if (!p.coordinates?.lat || !p.coordinates?.lng) return true;
        const dist = haversineDistance(centerLat, centerLng, p.coordinates.lat, p.coordinates.lng);
        return dist <= maxRadiusKm;
    });
}

/**
 * Apply proximity optimization to all days in an itinerary
 */
function optimizeItineraryProximity(itinerary) {
    return itinerary.map(day => ({
        ...day,
        places: sortPlacesByProximity(day.places || []),
    }));
}

module.exports = { haversineDistance, sortPlacesByProximity, optimizeItineraryProximity, validateCoordinatesWithinRadius };
