/**
 * HandCard - Represents a card in a player's hand, deck, or discard pile.
 * Extends BaseCard with configurations suitable for player cards.
 */
class HandCard extends BaseCard {
    constructor(scene, x, y, cardId, options = {}) {
        const cardInfo = getCardInfo(cardId);

        // Define default options for a HandCard
        const defaultOptions = {
            width: 120,
            height: 180,
            fontSize: 28,
            interactive: true,
            hoverMoveDistance: 30,
            hoverZoom: 1.1,
        };

        // Merge defaults with any provided options
        const finalOptions = { ...defaultOptions, ...options };

        super(scene, x, y, cardId, cardInfo, finalOptions);
    }

    /**
     * Implements the required method to create a card for the viewscreen.
     */
    createViewscreenCard(options) {
        return new HandCard(this.scene, 0, 0, this.cardId, options);
    }
}
