/**
 * gridCardDictionary.js - Defines the data for cards that can appear on the central grid.
 * The structure allows for different "difficulties" or tiers of cards.
 */

const GRID_CARD_DATA = {
    // Easy tier cards
    easy: [
        { id: 'grid_e_1', value: 1 },
        { id: 'grid_e_2', value: 2 },
        { id: 'grid_e_3', value: 3 },
        { id: 'grid_e_4', value: 4 },
        { id: 'grid_e_5', value: 5 },
    ],
    // Medium tier cards
    medium: [
        { id: 'grid_m_1', value: 10 },
        { id: 'grid_m_2', value: 11 },
        { id: 'grid_m_3', value: 12 },
        { id: 'grid_m_4', value: 13 },
        { id: 'grid_m_5', value: 14 },
    ],
    // Hard tier cards
    hard: [
        { id: 'grid_h_1', value: 20 },
        { id: 'grid_h_2', value: 21 },
        { id: 'grid_h_3', value: 22 },
        { id: 'grid_h_4', value: 23 },
        { id: 'grid_h_5', value: 24 },
    ]
};

// A utility function to get card info by its ID from the grid dictionary.
// This is separate from the main card dictionary to keep concerns separated.
function getGridCardInfo(cardId) {
    for (const difficulty in GRID_CARD_DATA) {
        const card = GRID_CARD_DATA[difficulty].find(c => c.id === cardId);
        if (card) {
            return { ...card, type: 'grid' }; // Add a type for potential future use
        }
    }
    return { id: cardId, value: '??', type: 'grid' }; // Fallback for unknown grid card ID
}