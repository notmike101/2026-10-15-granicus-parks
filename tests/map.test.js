import { describe, expect, it, vi } from 'vitest';

import { computeBounds, markerLabel } from '../src/map.js';

// Leaflet needs a browser. These tests use only the pure helpers.
vi.mock('leaflet', () => ({ default: {} }));

const parks = [
    { name: 'North Park', location: { lat: 41, lng: -74, address: '12 Park Road' } },
    { name: 'West Park', location: { lat: 39, lng: -76, address: null } },
    { name: 'East Park', location: { lat: 40, lng: -72, address: null } },
];

describe('computeBounds', () => {
    it('returns the exact box with negative longitudes', () => {
        expect(computeBounds(parks)).toEqual({ south: 39, west: -76, north: 41, east: -72 });
    });

    it('returns null when no parks exist', () => {
        expect(computeBounds([])).toBeNull();
    });
});

describe('markerLabel', () => {
    it('includes the address when present', () => {
        expect(markerLabel(parks[0])).toBe('North Park, 12 Park Road');
    });

    it('omits a null address', () => {
        expect(markerLabel(parks[1])).toBe('West Park');
    });
});
