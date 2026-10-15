// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { normalizePark } from '../../src/data.js';
import '../../src/ui/detail.js';

const park = normalizePark({
    name: 'Garden Park',
    description: 'A quiet garden.',
    location: { address: '12 Willow Street' },
    hours: 'Dawn to dusk',
    images: ['https://images.example.com/park.jpg'],
    amenities: ['gardens'],
    acreage: 12,
    rating: 4.5,
    links: { website: 'https://example.org/park', map: 'https://example.org/map' },
});

beforeEach(() => {
    // jsdom lacks dialog methods, modal focus trapping, and native Escape handling.
    Object.defineProperties(HTMLDialogElement.prototype, {
        showModal: {
            configurable: true,
            /**
             * Simulate the modal open state.
             *
             * @returns {void}
             */
            value() {
                this.setAttribute('open', '');
            },
        },
        close: {
            configurable: true,
            /**
             * Simulate the native close event.
             *
             * @returns {void}
             */
            value() {
                this.removeAttribute('open');
                this.dispatchEvent(new Event('close'));
            },
        },
    });
});

afterEach(() => {
    document.body.replaceChildren();
    delete HTMLDialogElement.prototype.showModal;
    delete HTMLDialogElement.prototype.close;
});

describe('park detail', () => {
    it('opens with the park name and available information', () => {
        const detail = document.createElement('park-detail');

        document.body.append(detail);
        detail.open(park);
        const dialog = detail.querySelector('dialog');

        expect(dialog.open).toBe(true);
        expect(dialog.querySelector('h2').textContent).toBe('Garden Park');
        expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h2').id);
        expect(dialog.textContent).toContain('12 Willow Street');
        expect(dialog.textContent).toContain('Dawn to dusk');
        expect(dialog.textContent).toContain('12 acres');
        expect(dialog.textContent).toContain('4.5');
        expect(dialog.querySelectorAll('a')).toHaveLength(2);
    });

    it('omits absent sections instead of empty headings or N/A text', () => {
        const detail = document.createElement('park-detail');

        document.body.append(detail);
        detail.open(normalizePark({ name: 'Quiet Park', description: null, hours: '', rating: null }));

        for (const section of ['description', 'hours', 'rating', 'acreage', 'address', 'amenities', 'links']) {
            expect(detail.querySelector(`[data-section="${section}"]`)).toBeNull();
        }

        expect(detail.textContent).not.toContain('N/A');
    });

    it('replaces a broken image with an accessible placeholder', () => {
        const detail = document.createElement('park-detail');

        document.body.append(detail);
        detail.open(park);
        const image = detail.querySelector('img');

        image.dispatchEvent(new Event('error'));
        expect(new URL(image.src).pathname).toBe('/assets/missing-park.svg');
        expect(image.alt).toBe('Image unavailable');
        image.dispatchEvent(new Event('error'));
        expect(new URL(image.src).pathname).toBe('/assets/missing-park.svg');
    });

    it('shows one placeholder when the park has no images', () => {
        const detail = document.createElement('park-detail');

        document.body.append(detail);
        detail.open(normalizePark({ name: 'Quiet Park', images: [] }));
        expect(detail.querySelectorAll('img')).toHaveLength(1);
        expect(new URL(detail.querySelector('img').src).pathname).toBe('/assets/missing-park.svg');
        expect(detail.querySelector('img').alt).toBe('Image unavailable');
    });

    it('closes with a labelled button and restores opener focus', () => {
        const opener = document.createElement('button');
        const detail = document.createElement('park-detail');

        document.body.append(opener, detail);
        opener.focus();
        detail.open(park);
        const close = detail.querySelector('button[aria-label="Close park details"]');

        close.focus();
        close.click();
        expect(detail.querySelector('dialog').open).toBe(false);
        expect(document.activeElement).toBe(opener);
    });

    it('closes on dialog cancellation and restores focus', () => {
        const opener = document.createElement('button');
        const detail = document.createElement('park-detail');

        document.body.append(opener, detail);
        opener.focus();
        detail.open(park);
        detail.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
        expect(detail.querySelector('dialog').open).toBe(false);
        expect(document.activeElement).toBe(opener);
    });
});
