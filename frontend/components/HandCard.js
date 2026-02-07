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
     * Creates the visual content for the face of a hand card.
     * This includes the card value and mana cost.
     */
    _createCardContent() {
        // Mana cost text (top-left)
        if (this.cardInfo.cost && this.cardInfo.cost.mana !== undefined) {
            const manaCostText = this.scene.add.text(
                -this.width / 2 + 10,
                -this.height / 2 + 10,
                this.cardInfo.cost.mana.toString(),
                {
                    font: `bold ${this.fontSize}px Arial`,
                    fill: '#ffffff',
                    backgroundColor: '#007bff',
                    padding: { x: 8, y: 2 }
                }
            ).setOrigin(0, 0); // Origin should be top-left
            this.faceContentContainer.add(manaCostText);


        // Card value text (top-right)
        const valueText = this.scene.add.text(
            this.width / 2 - 10,
            -this.height / 2 + 10,
            this.cardInfo.value.toString(),
            { font: `bold ${this.fontSize}px Arial`, fill: '#000000' }
        ).setOrigin(1, 0); // Origin should be top-right

        this.faceContentContainer.add(valueText);

        }
    }

    /**
     * Implements the required method to create a card for the viewscreen.
     */
    createViewscreenCard(options) {
        return new HandCard(this.scene, 0, 0, this.cardId, options);
    }
}
