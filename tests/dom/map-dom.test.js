// @vitest-environment jsdom
import L from 'leaflet';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createParkMap, markerLabel, mountMap } from '../../src/map.js';

const parks = [
    { id: 'north', name: 'North Park', location: { lat: 41, lng: -74, address: '12 Park Road' } },
    { id: 'west', name: 'West Park', location: { lat: 39, lng: -76, address: null } },
    { id: 'east', name: 'East Park', location: { lat: 40, lng: -72, address: null } },
];

let container;
let mapSpy;

beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    Object.defineProperty(container, 'clientHeight', { value: 600 });
    document.body.append(container);
    mapSpy = vi.spyOn(L, 'map');
});

afterEach(() => {
    for (const result of mapSpy.mock.results) {
        result.value.remove();
    }

    vi.restoreAllMocks();
    container.remove();
});

describe('createParkMap', () => {
    it('returns the map controls and one labeled marker per park', () => {
        const controls = createParkMap(container, parks);
        const map = mapSpy.mock.results[0].value;

        map.invalidateSize();

        expect(controls.focus).toBeTypeOf('function');
        expect(controls.setParks).toBeTypeOf('function');
        expect(controls.selectMarker).toBeTypeOf('function');
        const markers = [...container.querySelectorAll('.park-marker')];

        expect(markers).toHaveLength(parks.length);
        expect(markers.map((marker) => marker.getAttribute('aria-label'))).toEqual(parks.map(markerLabel));
        expect(markers.every((marker) => marker.tabIndex === 0)).toBe(true);
        expect(markers.map((marker) => marker.title)).toEqual(parks.map(markerLabel));
    });

    it('replaces all markers with a two-park subset and refits the map', () => {
        const fitSpy = vi.spyOn(L.Map.prototype, 'fitBounds');
        const controls = createParkMap(container, parks);

        expect(fitSpy).toHaveBeenLastCalledWith([[39, -76], [41, -72]], { padding: [40, 40] });

        controls.setParks(parks.slice(0, 2));
        const markers = [...container.querySelectorAll('.park-marker')];

        expect(markers).toHaveLength(2);
        expect(markers.map((marker) => marker.getAttribute('aria-label'))).toEqual(parks.slice(0, 2).map(markerLabel));
        expect(fitSpy).toHaveBeenLastCalledWith([[39, -76], [41, -74]], { padding: [40, 40] });

        controls.setParks([]);
        expect(container.querySelectorAll('.park-marker')).toHaveLength(0);
        expect(fitSpy).toHaveBeenCalledTimes(2);
    });

    it('selects a park on click or Enter', () => {
        const onSelect = vi.fn();

        createParkMap(container, parks, { onSelect });
        const markers = container.querySelectorAll('.park-marker');

        markers[0].click();
        expect(onSelect).toHaveBeenLastCalledWith(parks[0]);
        markers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(onSelect).toHaveBeenLastCalledWith(parks[1]);
        expect(onSelect).toHaveBeenCalledTimes(2);
        markers[2].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        expect(onSelect).toHaveBeenLastCalledWith(parks[2]);
        expect(onSelect).toHaveBeenCalledTimes(3);
    });

    it('pans to a park, opens safe tooltip text, and marks the selection', () => {
        const panSpy = vi.spyOn(L.Map.prototype, 'panTo');
        const controls = createParkMap(container, parks);

        controls.focus(parks[1]);
        expect(panSpy).toHaveBeenCalledWith([39, -76]);
        expect(container.querySelector('.leaflet-tooltip').textContent).toBe('West Park');

        controls.selectMarker(parks[1]);
        const markers = container.querySelectorAll('.park-marker');

        expect(markers[0].getAttribute('aria-pressed')).toBe('false');
        expect(markers[1].getAttribute('aria-pressed')).toBe('true');
        controls.selectMarker(parks[2]);
        expect(markers[1].getAttribute('aria-pressed')).toBe('false');
        expect(markers[2].getAttribute('aria-pressed')).toBe('true');
    });

    it('uses text rather than HTML for park tooltip content', () => {
        const park = { ...parks[0], name: '<img src=x onerror=alert(1)>' };
        const controls = createParkMap(container, [park]);

        controls.focus(park);
        const tooltip = container.querySelector('.leaflet-tooltip');

        expect(tooltip.textContent).toBe(`${park.name}, 12 Park Road`);
        expect(tooltip.querySelector('img')).toBeNull();
    });
});

describe('mountMap', () => {
    it('mounts once and keeps catalog selection and filters in sync', () => {
        container.id = 'map';
        const controls = mountMap();

        expect(mountMap()).toBe(controls);
        expect(mapSpy).toHaveBeenCalledTimes(1);
        document.dispatchEvent(new CustomEvent('parks:ready', { detail: { parks } }));
        expect(container.querySelectorAll('.park-marker')).toHaveLength(3);
        expect([...container.querySelectorAll('.park-marker')].map((marker) => marker.getAttribute('aria-label'))).toEqual(parks.map(markerLabel));

        const detail = document.createElement('park-detail');

        detail.open = vi.fn();
        document.body.append(detail);
        const selection = vi.fn();

        document.addEventListener('park:select', selection);
        container.querySelector('.park-marker').click();
        expect(detail.open).toHaveBeenCalledExactlyOnceWith(parks[0]);
        expect(selection.mock.calls[0][0].detail.park).toBe(parks[0]);
        document.dispatchEvent(new CustomEvent('park:select', { detail: { park: parks[1] } }));
        expect(detail.open).toHaveBeenCalledTimes(1);
        expect(container.querySelectorAll('.park-marker')[1].getAttribute('aria-pressed')).toBe('true');
        document.dispatchEvent(new CustomEvent('parks:filter', { detail: { parks: parks.slice(0, 2) } }));
        expect(container.querySelectorAll('.park-marker')).toHaveLength(2);
        document.removeEventListener('park:select', selection);
        detail.remove();
    });
});
