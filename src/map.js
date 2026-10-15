import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import sampleParks from '../assets/parks.sample.json';

const mountedMaps = new WeakMap();

/**
 * Calculate the smallest coordinate box that contains the parks.
 *
 * @param {object[]} parks - Parks with latitude and longitude values.
 * @returns {{south: number, west: number, north: number, east: number}|null} Coordinate box, or null for an empty list.
 */
function computeBounds(parks) {
    if (parks.length === 0) {
        return null;
    }

    const bounds = { south: Infinity, west: Infinity, north: -Infinity, east: -Infinity };

    for (const { location } of parks) {
        bounds.south = Math.min(bounds.south, location.lat);
        bounds.west = Math.min(bounds.west, location.lng);
        bounds.north = Math.max(bounds.north, location.lat);
        bounds.east = Math.max(bounds.east, location.lng);
    }

    return bounds;
}

/**
 * Include the park address in the marker label when available.
 *
 * @param {object} park - Park with a name and location.
 * @returns {string} Accessible marker label.
 */
function markerLabel(park) {
    return park.location.address ? `${park.name}, ${park.location.address}` : park.name;
}

/**
 * Create a map with keyboard controls and one marker per park.
 *
 * @param {HTMLElement} el - Empty map container with a nonzero height.
 * @param {object[]} parks - Parks to show on the map.
 * @param {object} [options] - Selection options.
 * @param {function(object): void} [options.onSelect] - Receive the selected park.
 * @returns {{focus: function(object): void, setParks: function(object[]): void, selectMarker: function(object): void}} Map controls.
 */
function createParkMap(el, parks, options = {}) {
    const map = L.map(el);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors © CARTO',
    }).addTo(map);

    const style = document.createElement('style');

    style.textContent = `
        .park-marker { color: #166534; border-radius: 4px; }
        .park-marker:focus-visible { outline: 3px solid #111827; outline-offset: 4px; }
        .park-marker[aria-pressed="true"] { color: #7c2d12; outline: 3px dashed #111827; outline-offset: 2px; }
        .park-marker[aria-pressed="true"]:focus-visible { outline-style: solid; outline-offset: 5px; }
    `;
    el.append(style);
    const icon = L.divIcon({
        className: 'park-marker',
        iconSize: [28, 32],
        iconAnchor: [14, 32],
        tooltipAnchor: [0, -28],
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32" aria-hidden="true"><path d="M14 30C11 25 3 18 3 12a11 11 0 0 1 22 0c0 6-8 13-11 18Z" fill="currentColor" stroke="#111827" stroke-width="2"/><circle cx="14" cy="12" r="4" fill="#fff"/></svg>',
    });
    const markers = new Map();
    let currentParks = parks;
    let lastArea = el.clientWidth * el.clientHeight;
    let selectedId = null;

    /**
     * Fit the viewport to the current parks after a container resize.
     *
     * @returns {void}
     */
    function refit() {
        const bounds = computeBounds(currentParks);

        map.invalidateSize();

        if (bounds) {
            const { south, west, north, east } = bounds;

            map.fitBounds([[south, west], [north, east]], { padding: [40, 40] });
        }
    }

    /**
     * Refit when a hidden container becomes visible.
     *
     * @returns {void}
     */
    function handleResize() {
        const area = el.clientWidth * el.clientHeight;

        if (area > 0 && lastArea === 0) {
            refit();
        }

        lastArea = area;
    }

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(handleResize).observe(el);
    }

    /**
     * Mark the selected park without changing keyboard focus.
     *
     * @param {object} park - Selected park.
     * @returns {void}
     */
    function selectMarker(park) {
        selectedId = park.id;

        for (const [id, marker] of markers) {
            marker.getElement().setAttribute('aria-pressed', String(id === selectedId));
        }
    }

    /**
     * Move the map to a park and show its label.
     *
     * @param {object} park - Park to show.
     * @returns {void}
     */
    function focus(park) {
        const marker = markers.get(park.id);

        if (marker) {
            map.panTo([park.location.lat, park.location.lng]);
            marker.openTooltip();
        }
    }

    /**
     * Replace the markers and fit the viewport to the visible parks.
     *
     * @param {object[]} nextParks - Parks to show.
     * @returns {void}
     */
    function setParks(nextParks) {
        currentParks = nextParks;

        for (const marker of markers.values()) {
            marker.remove();
        }

        markers.clear();
        const bounds = computeBounds(nextParks);

        if (bounds) {
            const { south, west, north, east } = bounds;

            map.fitBounds([[south, west], [north, east]], { padding: [40, 40] });
        } else if (!map.getZoom()) {
            map.setView([0, 0], 2);
        }

        for (const park of nextParks) {
            const label = markerLabel(park);
            const tooltip = document.createElement('span');

            tooltip.textContent = label;
            const marker = L.marker([park.location.lat, park.location.lng], {
                icon,
                keyboard: true,
                title: label,
                alt: label,
            }).addTo(map).bindTooltip(tooltip);
            const element = marker.getElement();

            element.setAttribute('aria-label', label);
            element.setAttribute('aria-pressed', String(park.id === selectedId));
            marker.on('click', () => {
                selectMarker(park);
                options.onSelect?.(park);
            });
            element.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    marker.fire('click');
                }
            });
            markers.set(park.id, marker);
        }
    }

    setParks(parks);

    return { focus, setParks, selectMarker };
}

/**
 * Mount the map once and connect catalog selection and filter events.
 *
 * @returns {{focus: function(object): void, setParks: function(object[]): void, selectMarker: function(object): void}} Map controls.
 */
function mountMap() {
    let container = document.querySelector('#map');

    if (!container) {
        const heading = document.createElement('h1');

        heading.textContent = 'Park map';
        container = document.createElement('div');
        container.id = 'map';
        container.className = 'map-panel';
        container.style.height = '75vh';
        container.style.minHeight = '320px';
        document.querySelector('#app').append(heading, container);
    }

    if (mountedMaps.has(container)) {
        return mountedMaps.get(container);
    }

    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Park map');
    const controls = createParkMap(container, sampleParks, {
        /**
         * Open the park details and notify the catalog.
         *
         * @param {object} park - Selected park.
         * @returns {void}
         */
        onSelect: (park) => {
            document.querySelector('park-detail')?.open(park);
            document.dispatchEvent(new CustomEvent('park:select', { detail: { park } }));
        },
    });

    mountedMaps.set(container, controls);
    document.addEventListener('parks:ready', (event) => {
        controls.setParks(event.detail.parks);
    });
    document.addEventListener('parks:filter', (event) => {
        controls.setParks(event.detail.parks);
    });
    document.addEventListener('park:select', (event) => {
        controls.selectMarker(event.detail.park);
        controls.focus(event.detail.park);
    });

    return controls;
}

export { computeBounds, markerLabel, createParkMap, mountMap };
