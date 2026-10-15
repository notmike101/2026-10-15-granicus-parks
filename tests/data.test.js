import { describe, expect, it } from 'vitest';

import { boundsOfParks, collectUniqueAmenities, filterParks, loadParks, normalizePark, searchParks } from '../src/data.js';

const raw = {
    id: 'garden',
    name: 'Garden Park',
    description: 'A quiet woodland garden.',
    location: { lat: 40.7, lng: -74, address: '12 Willow Street' },
    amenities: ['trails', 'gardens'],
    hours: 'Dawn to dusk',
    images: ['https://example.org/park.jpg'],
    acreage: 12,
    rating: 4.5,
    links: { website: 'https://example.org', map: 'https://example.org/map' },
    neighborhood: 'Brooklyn',
    source: 'augmented',
};
const parks = [normalizePark(raw), normalizePark({
    id: 'field',
    name: 'Field Park',
    location: { lat: 40.8, lng: -73.8 },
    amenities: ['trails', 'playground'],
})];

describe('park data', () => {
    it.each(Object.keys(raw))('accepts a missing %s field', (field) => {
        const record = { ...raw };

        delete record[field];
        expect(() => normalizePark(record)).not.toThrow();
        expect(normalizePark(record)).toHaveProperty(field);
    });

    it.each([undefined, null, {}])('normalizes an absent record %s', (record) => {
        expect(normalizePark(record)).toEqual({
            id: null,
            name: null,
            description: null,
            location: { lat: null, lng: null, address: null },
            amenities: [],
            hours: null,
            images: [],
            acreage: null,
            rating: null,
            links: [],
            neighborhood: null,
            source: 'sample',
        });
    });

    it('normalizes null and empty fields without losing zero values', () => {
        const park = normalizePark({
            name: '  ', description: null, location: null, amenities: null,
            hours: '', images: [], acreage: 0, rating: 0, links: null,
        });

        expect(park.name).toBeNull();
        expect(park.description).toBeNull();
        expect(park.location).toEqual({ lat: null, lng: null, address: null });
        expect(park.amenities).toEqual([]);
        expect(park.images).toEqual([]);
        expect(park.hours).toBeNull();
        expect(park.acreage).toBe(0);
        expect(park.rating).toBe(0);
        expect(park.links).toEqual([]);
    });

    it('keeps labelled links from the sample array shape', () => {
        const park = normalizePark({
            name: 'Lake Park',
            links: [
                { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Lake_Park' },
                { label: 'Postal', url: 'mailto:park@example.org' },
                { url: '/relative/path' },
                { label: 'Duplicate', url: 'https://en.wikipedia.org/wiki/Lake_Park' },
            ],
        });

        expect(park.links).toEqual([{ label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Lake_Park' }]);
    });

    it('labels website and map links from the object shape', () => {
        const park = normalizePark({ name: 'Grid Park', links: { website: 'https://example.org', map: '   ' } });

        expect(park.links).toEqual([{ label: 'Park website', url: 'https://example.org' }]);
    });

    it('removes invalid numbers and blank array items', () => {
        const park = normalizePark({
            location: { lat: Number.NaN, lng: Number.POSITIVE_INFINITY },
            acreage: 'large', rating: Number.NaN, amenities: ['', null, ' trails '],
        });

        expect(park.location.lat).toBeNull();
        expect(park.location.lng).toBeNull();
        expect(park.acreage).toBeNull();
        expect(park.rating).toBeNull();
        expect(park.amenities).toEqual(['trails']);
    });

    it.each(['WILLOW', 'WOODLAND', 'brookLYN', 'GARDEN'])('finds parks for %s without case sensitivity', (query) => {
        expect(searchParks(parks, query).map((park) => park.id)).toEqual(['garden']);
    });

    it('keeps every park for a blank search', () => {
        expect(searchParks(parks, '  ')).toHaveLength(2);
    });

    it('requires every selected amenity', () => {
        expect(filterParks(parks, ['trails', 'gardens']).map((park) => park.id)).toEqual(['garden']);
        expect(filterParks(parks, ['gardens', 'playground'])).toEqual([]);
        expect(filterParks(parks, [])).toHaveLength(2);
    });

    it('returns sorted unique amenities', () => {
        expect(collectUniqueAmenities(parks)).toEqual(['gardens', 'playground', 'trails']);
    });

    it('returns the exact coordinate bounds', () => {
        expect(boundsOfParks(parks)).toEqual({ south: 40.7, west: -74, north: 40.8, east: -73.8 });
    });

    it('returns empty bounds when there are no valid coordinates', () => {
        expect(boundsOfParks([normalizePark(null)])).toEqual({ south: null, west: null, north: null, east: null });
    });

    it('loads one record per park id with finite coordinates', () => {
        const loaded = loadParks();
        const ids = loaded.map((park) => park.id);

        expect(ids).toEqual([...new Set(ids)]);
        expect(loaded.length).toBeGreaterThanOrEqual(21);
        expect(loaded.every((park) => Number.isFinite(park.location.lat) && Number.isFinite(park.location.lng))).toBe(true);
    });

    it('merges an augmented record into the sample record it repeats', () => {
        const washington = loadParks().find((park) => park.id === 'washington-square-park');

        expect(washington.links.map((link) => link.url)).toEqual([
            'https://en.wikipedia.org/wiki/Washington_Square_Park',
            'https://www.nycgovparks.org/parks/washington-square-park',
            'https://www.openstreetmap.org/?mlat=40.7308&mlon=-73.9973#map=17/40.7308/-73.9973',
        ]);
        expect(washington.neighborhood).toBe('Greenwich Village');
        expect(washington.images.length).toBeGreaterThan(0);
        expect(washington.hours).toBe('6:00 AM - 12:00 AM');
    });
});
