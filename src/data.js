import additionalParks from '../assets/parks.additional.json';
import sampleParks from '../assets/parks.sample.json';

/**
 * Read a nonempty string.
 *
 * @param {unknown} value - Input value.
 * @returns {string|null} Trimmed string or null.
 */
function text(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * Read a finite number without coercion.
 *
 * @param {unknown} value - Input value.
 * @returns {number|null} Number or null.
 */
function number(value) {
    return Number.isFinite(value) ? value : null;
}

/**
 * Read nonempty strings from an array.
 *
 * @param {unknown} value - Input value.
 * @returns {string[]} Clean strings.
 */
function strings(value) {
    return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

/**
 * Normalize optional park fields without changing the input.
 *
 * @param {object|null} raw - Source record.
 * @returns {object} Park with a stable shape.
 */
function normalizePark(raw) {
    return {
        id: text(raw?.id),
        name: text(raw?.name),
        description: text(raw?.description),
        location: {
            lat: number(raw?.location?.lat),
            lng: number(raw?.location?.lng),
            address: text(raw?.location?.address),
        },
        amenities: strings(raw?.amenities),
        hours: text(raw?.hours),
        images: strings(raw?.images),
        acreage: number(raw?.acreage),
        rating: number(raw?.rating),
        links: {
            website: text(raw?.links?.website),
            map: text(raw?.links?.map),
        },
        neighborhood: text(raw?.neighborhood),
        source: raw?.source === 'augmented' ? 'augmented' : 'sample',
    };
}

/**
 * Load both bundled datasets.
 *
 * @returns {object[]} Normalized parks.
 */
function loadParks() {
    return [...sampleParks, ...additionalParks].map(normalizePark);
}

/**
 * Search names, addresses, descriptions, and neighborhoods.
 *
 * @param {object[]} parks - Parks to search.
 * @param {string} query - Search text.
 * @returns {object[]} Matching parks.
 */
function searchParks(parks, query) {
    const term = (text(query) ?? '').toLowerCase();

    return parks.filter((park) => [park.name, park.location.address, park.description, park.neighborhood]
        .some((value) => value?.toLowerCase().includes(term)) || !term);
}

/**
 * Require all selected amenities.
 *
 * @param {object[]} parks - Parks to filter.
 * @param {string[]} amenities - Selected amenities.
 * @returns {object[]} Matching parks.
 */
function filterParks(parks, amenities) {
    return parks.filter((park) => amenities.every((amenity) => park.amenities.includes(amenity)));
}

/**
 * Collect sorted unique amenity names.
 *
 * @param {object[]} parks - Source parks.
 * @returns {string[]} Amenity names.
 */
function amenityUniverse(parks) {
    return [...new Set(parks.flatMap((park) => park.amenities))].sort();
}

/**
 * Compute the box around valid park coordinates.
 *
 * @param {object[]} parks - Source parks.
 * @returns {{south: number|null, west: number|null, north: number|null, east: number|null}} Coordinate bounds.
 */
function boundsOfParks(parks) {
    const locations = parks.map((park) => park.location)
        .filter((location) => Number.isFinite(location?.lat) && Number.isFinite(location?.lng));

    if (locations.length === 0) {
        return { south: null, west: null, north: null, east: null };
    }

    const latitudes = locations.map((location) => location.lat);
    const longitudes = locations.map((location) => location.lng);

    return {
        south: Math.min(...latitudes),
        west: Math.min(...longitudes),
        north: Math.max(...latitudes),
        east: Math.max(...longitudes),
    };
}

export { loadParks, normalizePark, searchParks, filterParks, amenityUniverse, boundsOfParks };
