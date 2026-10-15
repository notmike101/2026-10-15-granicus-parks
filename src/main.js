import { mountMap } from './map.js';
import { mountCatalog } from './ui/list.js';

/**
 * Mount the catalog panel, then the map inside the region it reserves.
 *
 * @returns {void}
 */
function main() {
    mountCatalog();
    mountMap();
}

main();
