import additionalParks from '../assets/parks.additional.json';
import sampleParks from '../assets/parks.sample.json';

/**
 * Read a nonempty string.
 *
 * @param {unknown} value - Input value.
 * @returns {string|null} Trimmed string or null.
 */
function readTrimmedText(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * Read a finite number without coercion.
 *
 * @param {unknown} value - Input value.
 * @returns {number|null} Number or null.
 */
function readFiniteNumber(value) {
    return Number.isFinite(value) ? value : null;
}

/**
 * Read nonempty strings from an array.
 *
 * @param {unknown} value - Input value.
 * @returns {string[]} Clean strings.
 */
function readTrimmedStringList(value) {
    return Array.isArray(value) ? value.map(readTrimmedText).filter(Boolean) : [];
}

/**
 * Accept only HTTP and HTTPS URLs.
 *
 * @param {string} url - Candidate URL.
 * @returns {boolean} Whether the URL can be published as a link.
 */
function isWebUrl(url) {
    try {
        return ['http:', 'https:'].includes(new URL(url).protocol);
    } catch {
        return false;
    }
}

const objectLinkLabels = { website: 'Park website', map: 'Map and directions' };

/**
 * Read labelled web links from either source shape.
 *
 * The supplied sample file lists links as an array of label and URL
 * objects. The added records use website and map members. Both shapes
 * become one list, so the dialog can show every link.
 *
 * @param {unknown} value - Source links field.
 * @returns {{label: string, url: string}[]} Links in source order without repeated URLs.
 */
function readLinks(value) {
    const pairs = Array.isArray(value)
        ? value.map((entry) => [entry?.label, entry?.url ?? entry?.href])
        : Object.entries(objectLinkLabels).map(([key, label]) => [label, value?.[key]]);
    const links = [];

    for (const [label, url] of pairs) {
        const text = readTrimmedText(url);

        if (text && isWebUrl(text) && !links.some((link) => link.url === text)) {
            links.push({ label: readTrimmedText(label) || 'More information', url: text });
        }
    }

    return links;
}

/**
 * Normalize optional park fields without changing the input.
 *
 * @param {object|null} raw - Source record.
 * @returns {object} Park with a stable shape.
 */
function normalizePark(raw) {
    return {
        id: readTrimmedText(raw?.id),
        name: readTrimmedText(raw?.name),
        description: readTrimmedText(raw?.description),
        location: {
            lat: readFiniteNumber(raw?.location?.lat),
            lng: readFiniteNumber(raw?.location?.lng),
            address: readTrimmedText(raw?.location?.address),
        },
        amenities: readTrimmedStringList(raw?.amenities),
        hours: readTrimmedText(raw?.hours),
        images: readTrimmedStringList(raw?.images),
        acreage: readFiniteNumber(raw?.acreage),
        rating: readFiniteNumber(raw?.rating),
        links: readLinks(raw?.links),
        neighborhood: readTrimmedText(raw?.neighborhood),
        source: raw?.source === 'augmented' ? 'augmented' : 'sample',
    };
}

/**
 * Report whether a value carries information.
 *
 * @param {unknown} value - Field value from a park record.
 * @returns {boolean} True when the value is not null and not an empty array.
 */
function hasMeaningfulValue(value) {
    return value !== null && !(Array.isArray(value) && value.length === 0);
}

/**
 * Fill gaps in a park with fields from a later record with the same id.
 *
 * @param {object} base - Park read first.
 * @param {object} extra - Park read later with the same id.
 * @returns {object} Park that carries the fields of both records.
 */
function mergeParkRecords(base, extra) {
    const merged = { ...base };

    for (const key of ['name', 'description', 'hours', 'acreage', 'rating', 'neighborhood']) {
        if (hasMeaningfulValue(extra[key])) {
            merged[key] = extra[key];
        }
    }

    for (const key of ['amenities', 'images']) {
        if (extra[key].length > 0) {
            merged[key] = extra[key];
        }
    }

    for (const field of Object.keys(extra.location)) {
        if (hasMeaningfulValue(extra.location[field])) {
            merged.location = { ...merged.location, [field]: extra.location[field] };
        }
    }

    merged.links = readLinks([...base.links, ...extra.links]);

    return merged;
}

/**
 * Load both bundled datasets with one record per park id.
 *
 * The augmented file can extend a park that the sample file already lists.
 *
 * @returns {object[]} Normalized parks with unique ids.
 */
function loadParks() {
    const byId = new Map();

    for (const park of [...sampleParks, ...additionalParks].map(normalizePark)) {
        byId.set(park.id, byId.has(park.id) ? mergeParkRecords(byId.get(park.id), park) : park);
    }

    return [...byId.values()];
}

/**
 * Search names, addresses, descriptions, and neighborhoods.
 *
 * @param {object[]} parks - Parks to search.
 * @param {string} query - Search text.
 * @returns {object[]} Matching parks.
 */
function searchParks(parks, query) {
    const term = (readTrimmedText(query) ?? '').toLowerCase();

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
function collectUniqueAmenities(parks) {
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

export { loadParks, normalizePark, searchParks, filterParks, collectUniqueAmenities, boundsOfParks };
