import { amenityUniverse, filterParks, loadParks, searchParks } from '../data.js';
import './detail.js';
import '../styles.css';

let nextListId = 0;

/**
 * Create a searchable park list with amenity filters.
 *
 * @param {object} options - List options.
 * @param {object[]} options.parks - Available parks.
 * @param {function(object): void} options.onSelect - Park selection callback.
 * @returns {HTMLElement} List panel.
 */
function createParkList({ parks, onSelect }) {
    const panel = document.createElement('section');
    const listId = `park-list-${nextListId++}`;

    panel.className = 'park-list-panel';
    panel.setAttribute('aria-label', 'Park list');
    panel.innerHTML = `
        <h1 id="${listId}-heading">Find a park</h1>
        <label for="${listId}-search">Search parks</label>
        <input id="${listId}-search" type="search" placeholder="Name, address, or description">
        <fieldset><legend>Amenities</legend></fieldset>
        <p role="status" aria-live="polite" aria-atomic="true"></p>
        <ul class="park-results"></ul>
        <p class="park-empty" hidden>No parks match. Change the search or amenities.</p>
    `;
    const search = panel.querySelector('input[type="search"]');
    const fieldset = panel.querySelector('fieldset');
    const status = panel.querySelector('[role="status"]');
    const results = panel.querySelector('ul');
    const empty = panel.querySelector('.park-empty');

    for (const amenity of amenityUniverse(parks)) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.value = amenity;
        label.append(checkbox, document.createTextNode(amenity.replaceAll('-', ' ')));
        fieldset.append(label);
    }

    /**
     * Render the current search and filter results.
     *
     * @param {Event} [event] - User input event.
     * @returns {void}
     */
    function render(event) {
        const amenities = [...fieldset.querySelectorAll('input:checked')].map((input) => input.value);
        const visibleParks = filterParks(searchParks(parks, search.value), amenities);

        results.replaceChildren();

        for (const park of visibleParks) {
            const item = document.createElement('li');
            const button = document.createElement('button');
            const name = document.createElement('strong');

            button.type = 'button';
            button.dataset.parkId = park.id ?? '';
            button.setAttribute('aria-label', [park.name, park.location.address].filter(Boolean).join(', '));
            name.textContent = park.name;
            button.append(name);

            if (park.location.address) {
                const address = document.createElement('span');

                address.textContent = park.location.address;
                button.append(address);
            }

            button.addEventListener('click', () => onSelect(park));
            item.append(button);
            results.append(item);
        }

        status.textContent = `${visibleParks.length} ${visibleParks.length === 1 ? 'park' : 'parks'} found`;
        empty.hidden = visibleParks.length !== 0;

        if (event) {
            document.dispatchEvent(new CustomEvent('parks:filter', { detail: { parks: visibleParks } }));
        }
    }

    search.addEventListener('input', render);
    fieldset.addEventListener('change', render);
    render();

    return panel;
}

/**
 * Mount the standalone catalog and reserve the map region.
 *
 * @returns {{parks: object[], list: HTMLElement, detail: HTMLElement, shell: HTMLElement}} Catalog elements and data.
 */
function mountCatalog() {
    const parks = loadParks();
    const shell = document.createElement('div');
    const detail = document.createElement('park-detail');
    const list = createParkList({
        parks,
        /**
         * Show the selected park and notify the map.
         *
         * @param {object} park - Selected park.
         * @returns {void}
         */
        onSelect: (park) => {
            detail.open(park);
            document.dispatchEvent(new CustomEvent('park:select', { detail: { park } }));
        },
    });
    const map = document.createElement('div');

    shell.className = 'app-shell';
    shell.dataset.view = 'list';
    list.id = 'park-list-panel';
    map.id = 'map';
    map.className = 'map-panel';
    map.setAttribute('aria-label', 'Park map');
    shell.append(list, map, detail);
    document.querySelector('#app').replaceChildren(shell);
    queueMicrotask(() => document.dispatchEvent(new CustomEvent('parks:ready', { detail: { parks, list, detail, shell } })));

    return { parks, list, detail, shell };
}

export { createParkList, mountCatalog };
