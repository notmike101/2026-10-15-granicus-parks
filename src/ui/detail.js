// Vite keeps the fallback image as a separate build asset.
// eslint-disable-next-line import/no-unresolved
import missingPark from '../../assets/missing-park.svg?url&no-inline';

let nextDetailId = 0;

/**
 * Append a section only when its value exists.
 *
 * @param {HTMLElement} content - Section container.
 * @param {string} key - Section name.
 * @param {string|null} value - Section text.
 * @returns {void}
 */
function appendText(content, key, value) {
    if (value === null || value === undefined || value === '') {
        return;
    }

    const paragraph = document.createElement('p');

    paragraph.dataset.section = key;
    paragraph.textContent = value;
    content.append(paragraph);
}

/**
 * Accept only web links.
 *
 * @param {string|null} value - Link URL.
 * @returns {boolean} Whether the URL uses HTTP or HTTPS.
 */
function isWebLink(value) {
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

/** Park details with native modal keyboard behavior. */
class ParkDetail extends HTMLElement {
    /**
     * Create the dialog when the custom element mounts.
     *
     * @returns {void}
     */
    connectedCallback() {
        if (this.dialog) {
            return;
        }

        const headingId = `park-detail-title-${nextDetailId++}`;

        this.innerHTML = `
            <dialog class="park-detail-dialog" aria-labelledby="${headingId}">
                <button type="button" class="park-detail-close" aria-label="Close park details">Close</button>
                <h2 id="${headingId}"></h2>
                <div class="park-detail-content"></div>
            </dialog>
        `;
        this.dialog = this.querySelector('dialog');
        this.dialog.querySelector('button').addEventListener('click', () => this.closePark());
        this.dialog.addEventListener('cancel', (event) => {
            event.preventDefault();
            this.closePark();
        });
        this.dialog.addEventListener('close', () => {
            if (this.opener?.isConnected) {
                this.opener.focus();
            }
        });
        this.dialog.addEventListener('click', (event) => {
            const bounds = this.dialog.getBoundingClientRect();

            if (event.target === this.dialog && (event.clientX < bounds.left || event.clientX > bounds.right
                || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
                this.closePark();
            }
        });
    }

    /**
     * Show the available details for a park.
     *
     * @param {object} park - Normalized park.
     * @returns {void}
     */
    open(park) {
        if (!this.dialog.open) {
            this.opener = document.activeElement;
        }

        const content = this.querySelector('.park-detail-content');

        this.querySelector('h2').textContent = park.name;
        content.replaceChildren();
        appendText(content, 'address', park.location.address);
        appendText(content, 'neighborhood', park.neighborhood);
        appendText(content, 'description', park.description);
        appendText(content, 'hours', park.hours ? `Hours: ${park.hours}` : null);
        appendText(content, 'acreage', park.acreage === null ? null : `${park.acreage} acres`);
        appendText(content, 'rating', park.rating === null ? null : `Rating: ${park.rating} out of 5`);

        if (park.amenities.length > 0) {
            const amenities = document.createElement('ul');

            amenities.dataset.section = 'amenities';
            amenities.setAttribute('aria-label', 'Amenities');

            for (const amenity of park.amenities) {
                const item = document.createElement('li');

                item.textContent = amenity.replaceAll('-', ' ');
                amenities.append(item);
            }

            content.append(amenities);
        }

        const images = document.createElement('div');
        const sources = park.images.length > 0 ? park.images : [missingPark];

        images.dataset.section = 'images';

        for (const [index, source] of sources.entries()) {
            const image = document.createElement('img');

            image.src = source;
            image.alt = source === missingPark ? 'Image unavailable' : `${park.name} — photo ${index + 1}`;
            image.addEventListener('error', () => {
                image.src = missingPark;
                image.alt = 'Image unavailable';
            }, { once: true });
            images.append(image);
        }

        content.append(images);
        const links = document.createElement('p');

        links.dataset.section = 'links';

        for (const [key, label] of [['website', 'Park website'], ['map', 'Map and directions']]) {
            if (isWebLink(park.links[key])) {
                const link = document.createElement('a');

                link.href = park.links[key];
                link.textContent = label;
                links.append(link);
            }
        }

        if (links.children.length > 0) {
            content.append(links);
        }

        if (!this.dialog.open) {
            this.dialog.showModal();
        }
    }

    /**
     * Close the dialog and restore the previous focus.
     *
     * @returns {void}
     */
    closePark() {
        this.dialog.close();
    }
}

customElements.define('park-detail', ParkDetail);
