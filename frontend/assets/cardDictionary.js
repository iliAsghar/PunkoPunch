/**
 * cardDictionary.js
 * 
 * This file acts as a central registry for all player card data.
 * It collects the individual card objects, which are loaded via <script> tags
 * in index.html, and organizes them into a single, easily accessible object.
 */

const CARD_DATA = {
    ph1, ph2, ph3, ph4, ph5,
    ph6, ph7, ph8, ph9, ph10
};

/**
 * Retrieves the complete data object for a given card ID.
 * @param {string} cardId - The ID of the card (e.g., 'ph1').
 * @returns {object} The card's data object, or a default unknown card object.
 */
function getCardInfo(cardId) {
    return CARD_DATA[cardId] || {
        id: cardId,
        name: 'Unknown Card',
        value: '??',
        type: 'unknown',
        description: 'This card data could not be found.',
        cost: {},
        play: () => {
            console.error(`Play function not found for card ID: ${cardId}`);
        }
    };
}
