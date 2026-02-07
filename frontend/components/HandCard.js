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
        const cardTopHeight = this.height * 0.15;  // 15% of card height for top section
        const cardBottomHeight = this.height * 0.40; // 40% of card height for bottom section

        const padding = 10;

        // Mana cost text (top-left)
        if (this.cardInfo.cost && this.cardInfo.cost.mana !== undefined) {
            const manaCostText = this.scene.add.text(
                -this.width / 2 + padding,
                -this.height / 2 + padding,
                this.cardInfo.cost.mana.toString(),
                {
                    font: `bold ${this.fontSize}px Arial`,
                    fill: '#ffffff',
                    backgroundColor: '#007bff',
                    padding: { x: 8, y: 2 }
                }
            ).setOrigin(0, 0);
            this.faceContentContainer.add(manaCostText);
        }

        // Card value text (top-right)
        if (this.cardInfo.value !== undefined) {
            const valueText = this.scene.add.text(
                this.width / 2 - padding,
                -this.height / 2 + padding,
                this.cardInfo.value.toString(),
                { font: `bold ${this.fontSize}px Arial`, fill: '#000000' }
            ).setOrigin(1, 0);
            this.faceContentContainer.add(valueText);
        }

        const contentWidth = this.width - padding * 2;

        // --- Bottom-up Layout ---
        // Define the absolute bottom of the content area inside the card.
        const contentBottomY = this.height / 2 - padding;

        // --- Dynamic Font Sizing ---
        const availableHeight = cardBottomHeight - padding; // Total height for title + description
        
        // Base font sizes are now proportional to the card's main fontSize property.
        // This allows them to scale up correctly in viewscreen mode.
        let titleFontSize = this.fontSize * 0.65; // Approx 18 when fontSize is 28
        let descFontSize = this.fontSize * 0.5;  // Approx 14 when fontSize is 28

        const minFontSize = 8; // Don't shrink smaller than this

        let tempTitle, tempDesc, totalHeight;

        // Loop to shrink font sizes until the text fits
        do {
            // Create temporary text objects to measure height
            if (tempTitle) tempTitle.destroy();
            tempTitle = this.scene.add.text(0, 0, this.cardInfo.name, { font: `bold ${titleFontSize}px Arial`, wordWrap: { width: contentWidth } }).setVisible(false);

            if (tempDesc) tempDesc.destroy();
            tempDesc = this.scene.add.text(0, 0, this.cardInfo.description, { font: `${descFontSize}px Arial`, wordWrap: { width: contentWidth } }).setVisible(false);

            totalHeight = tempTitle.height + tempDesc.height + 4; // 4px gap

            // If it doesn't fit, shrink the larger font size, or both if they are close
            if (totalHeight > availableHeight) {
                if (titleFontSize > descFontSize && titleFontSize > minFontSize) {
                    titleFontSize--;
                } else if (descFontSize > minFontSize) {
                    descFontSize--;
                } else {
                    break; // Stop shrinking if we hit the minimum font size
                }
            }
        } while (totalHeight > availableHeight && (titleFontSize > minFontSize || descFontSize > minFontSize));

        // Create the final description text and anchor it to the bottom of the card.
        this.descriptionText = this.scene.add.text(
            0,
            contentBottomY, // Position its bottom edge at the content boundary.
            this.cardInfo.description,
            { font: `${descFontSize}px Arial`, fill: '#333333', align: 'center', wordWrap: { width: contentWidth } }
        ).setOrigin(0.5, 1); // Set origin to bottom-center.
        this.faceContentContainer.add(this.descriptionText);

        // --- Title ---
        // Now create the real title and anchor it right above the description.
        const titleY = this.descriptionText.y - this.descriptionText.height - 4;
        this.titleText = this.scene.add.text(0, titleY, this.cardInfo.name, { font: `bold ${titleFontSize}px Arial`, fill: '#000000', align: 'center', wordWrap: { width: contentWidth } }).setOrigin(0.5, 1);
        this.faceContentContainer.add(this.titleText);
    }

    /**
     * Implements the required method to create a card for the viewscreen.
     */
    createViewscreenCard(options) {
        return new HandCard(this.scene, 0, 0, this.cardId, options);
    }
}
