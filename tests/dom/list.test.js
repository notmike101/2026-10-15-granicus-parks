// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizePark } from '../../src/data.js';
import { createParkList } from '../../src/ui/list.js';

const parks = [
    normalizePark({ id: 'garden', name: 'Garden Park', location: { address: '12 Willow Street' }, amenities: ['gardens', 'trails'] }),
    normalizePark({ id: 'field', name: 'Field Park', location: {}, amenities: ['trails'] }),
];

afterEach(() => document.body.replaceChildren());

describe('park list', () => {
    it('labels its search control and filters with a live count', () => {
        const panel = createParkList({
            parks,
            onSelect: vi.fn(),
        });

        document.body.append(panel);
        const input = panel.querySelector('input[type="search"]');

        expect(panel.querySelector(`label[for="${input.id}"]`).textContent).toContain('Search');
        input.value = 'WILLOW';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(panel.querySelectorAll('ul > li')).toHaveLength(1);
        expect(panel.querySelector('ul').textContent).toContain('Garden Park');
        expect(panel.querySelector('[role="status"][aria-live="polite"]').textContent).toContain('1 park');
    });

    it('combines amenity checkboxes and search', () => {
        const panel = createParkList({
            parks,
            onSelect: vi.fn(),
        });

        document.body.append(panel);
        const checkbox = panel.querySelector('input[value="gardens"]');

        expect(checkbox.closest('fieldset').querySelector('legend').textContent).toContain('Amenities');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        expect(panel.querySelectorAll('ul > li')).toHaveLength(1);
        const input = panel.querySelector('input[type="search"]');

        input.value = 'Field';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(panel.querySelectorAll('ul > li')).toHaveLength(0);
    });

    it('uses readable button labels and selects the park', () => {
        const selected = [];
        const panel = createParkList({
            parks,
            /**
             * Record the selected park.
             *
             * @param {object} park - Selected park.
             * @returns {number} Selection count.
             */
            onSelect: (park) => selected.push(park.id),
        });
        const buttons = [...panel.querySelectorAll('ul > li > button')];

        expect(buttons).toHaveLength(2);
        expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['Garden Park, 12 Willow Street', 'Field Park']);
        buttons[0].click();
        expect(selected).toEqual(['garden']);
    });

    it('shows an empty state when no parks match', () => {
        const panel = createParkList({
            parks,
            onSelect: vi.fn(),
        });
        const input = panel.querySelector('input[type="search"]');

        input.value = 'No such park';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(panel.querySelectorAll('ul > li')).toHaveLength(0);
        expect(panel.textContent).toContain('No parks match');
        expect(panel.querySelector('[role="status"]').textContent).toContain('0 parks');
    });
});
