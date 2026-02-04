/**
 * gridCardDictionary.js - Defines the data for cards that can appear on the central grid.
 * The structure allows for different "difficulties" or tiers of cards.
 */

const GRID_CARD_DATA = {
    // Easy tier cards
    easy: [
        { id: 'grid_e_1', value: 21 },
        { id: 'grid_e_2', value: 24 },
        { id: 'grid_e_3', value: 28 },
        { id: 'grid_e_4', value: 30 },
        { id: 'grid_e_5', value: 33 },
        { id: 'grid_e_6', value: 35 },
        { id: 'grid_e_7', value: 37 },
        { id: 'grid_e_8', value: 40 },
        { id: 'grid_e_9', value: 42 },
        { id: 'grid_e_10', value: 45 },
        { id: 'grid_e_11', value: 48 },
        { id: 'grid_e_12', value: 50 },
    ],
    // Medium tier cards
    medium: [
        { id: 'grid_m_1', value: 52 },
        { id: 'grid_m_2', value: 55 },
        { id: 'grid_m_3', value: 59 },
        { id: 'grid_m_4', value: 63 },
        { id: 'grid_m_5', value: 68 },
        { id: 'grid_m_6', value: 71 },
        { id: 'grid_m_7', value: 75 },
        { id: 'grid_m_8', value: 80 },
        { id: 'grid_m_9', value: 84 },
        { id: 'grid_m_10', value: 88 },
        { id: 'grid_m_11', value: 92 },
        { id: 'grid_m_12', value: 96 },
        { id: 'grid_m_13', value: 99 },
    ],
    // Hard tier cards
    hard: [
        { id: 'grid_h_1', value: 105 },
        { id: 'grid_h_2', value: 110 },
        { id: 'grid_h_3', value: 115 },
        { id: 'grid_h_4', value: 122 },
        { id: 'grid_h_5', value: 128 },
        { id: 'grid_h_6', value: 135 },
        { id: 'grid_h_7', value: 144 },
        { id: 'grid_h_8', value: 150 },
        { id: 'grid_h_9', value: 157 },
        { id: 'grid_h_10', value: 165 },
        { id: 'grid_h_11', value: 172 },
        { id: 'grid_h_12', value: 180 },
        { id: 'grid_h_13', value: 188 },
        { id: 'grid_h_14', value: 195 },
        { id: 'grid_h_15', value: 200 },
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