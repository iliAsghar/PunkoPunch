// Card Dictionary - Define all card properties here
const CARD_DICTIONARY = {
    ph1: { value: 1 },
    ph2: { value: 2 },
    ph3: { value: 3 },
    ph4: { value: 4 },
    ph5: { value: 5 },
    ph6: { value: 6 },
    ph7: { value: 7 },
    ph8: { value: 8 },
    ph9: { value: 9 },
    ph10: { value: 10 }
};

function getCardInfo(cardId) {
    return CARD_DICTIONARY[cardId] || { value: 0 };
}
