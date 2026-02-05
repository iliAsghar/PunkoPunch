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

    // Implement the required method for the viewscreen
    createViewscreenCard(options) {
        return new GridCard(this.scene, 0, 0, this.cardId, options);
    }
}