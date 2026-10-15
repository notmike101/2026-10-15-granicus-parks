import { describe, expect, it } from 'vitest';

import { amenityUniverse, boundsOfParks, filterParks, loadParks, normalizePark, searchParks } from '../src/data.js';

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
            links: { website: null, map: null },
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
        expect(park.links).toEqual({ website: null, map: null });
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
        expect(amenityUniverse(parks)).toEqual(['gardens', 'playground', 'trails']);
    });

    it('returns the exact coordinate bounds', () => {
        expect(boundsOfParks(parks)).toEqual({ south: 40.7, west: -74, north: 40.8, east: -73.8 });
    });

    it('returns empty bounds when there are no valid coordinates', () => {
        expect(boundsOfParks([normalizePark(null)])).toEqual({ south: null, west: null, north: null, east: null });
    });

    it('loads at least 23 parks with finite coordinates', async () => {
        const loaded = await loadParks();

        expect(loaded.length).toBeGreaterThanOrEqual(23);
        expect(loaded.filter((park) => park.source === 'augmented')).toHaveLength(6);
        expect(loaded.every((park) => Number.isFinite(park.location.lat) && Number.isFinite(park.location.lng))).toBe(true);
    });
});
