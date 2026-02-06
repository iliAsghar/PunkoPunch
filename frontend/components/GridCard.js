/**
 * GridCard - Represents a card in the central grid.
 * Extends BaseCard with grid-specific configurations.
 */
class GridCard extends BaseCard {
    constructor(scene, x, y, cardId, options = {}) {
        const cardInfo = getGridCardInfo(cardId);

        // Define default options for a GridCard
        const defaultOptions = {
            width: 70,
            height: 70,
            fontSize: 35,
            interactive: true,
            hoverMoveDistance: 0,
            hoverZoom: 1.1,
            centerText: true,
        };

        // Merge defaults with any provided options
        const finalOptions = { ...defaultOptions, ...options };

        // Override the onClick to perform a flip
        finalOptions.onClick = () => this.flip();

        super(scene, x, y, cardId, cardInfo, finalOptions);
    }

    /**
     * Creates the visual content for the face of a grid card.
     * This is just the centered value.
     */
    _createCardContent() {
        // Card value text (centered)
        const valueText = this.scene.add.text(
            0,
            0,
            this.cardInfo.value.toString(),
            { font: `bold ${this.fontSize}px Arial`, fill: '#000000' }
        ).setOrigin(0.5, 0.5);
        this.faceContentContainer.add(valueText);
    }

    // Implement the required method for the viewscreen
    createViewscreenCard(options) {
        return new GridCard(this.scene, 0, 0, this.cardId, options);
    }
}