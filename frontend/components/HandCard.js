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

        // Make padding proportional to the card size to ensure it scales correctly.
        const padding = (this.height / 180) * 10;
        const topSectionY = -this.height / 2 + padding;

        // Mana cost text (top-left)
        if (this.cardInfo.cost && this.cardInfo.cost.mana !== undefined) {
            const manaCostText = this.scene.add.text(
                -this.width / 2 + padding,
                topSectionY,
                this.cardInfo.cost.mana.toString(),
                {
                    font: `bold ${this.fontSize}px Arial`,
                    fill: '#007bff',
                }
            ).setOrigin(0, 0);
            this.faceContentContainer.add(manaCostText);
        }

        // // Card value text (top-right) - Temporarily removed per request
        // if (this.cardInfo.value !== undefined) {
        //     const valueText = this.scene.add.text(
        //         this.width / 2 - padding,
        //         topSectionY,
        //         this.cardInfo.value.toString(),
        //         { font: `bold ${this.fontSize}px Arial`, fill: '#000000' }
        //     ).setOrigin(1, 0);
        //     this.faceContentContainer.add(valueText);
        // }

        const contentWidth = this.width - padding * 2;

        // --- Bottom-up Layout ---
        // Define the absolute bottom of the content area inside the card.
        const contentBottomY = this.height / 2 - padding;

        // --- Dynamic Text Fitting ---
        const processedDescription = this._getProcessedDescription();
        const minFontSize = (this.height / 180) * 8; // Scale min font size as well
        let titleFontSize = this.fontSize * 0.65;
        let descFontSize = this.fontSize * 0.5;

        // 1. Fit Title Width: Shrink title font size until it fits on a single line.
        let tempTitle = this.scene.add.text(0, 0, this.cardInfo.name, { font: `bold ${titleFontSize}px Arial` }).setVisible(false);
        while (tempTitle.width > contentWidth && titleFontSize > minFontSize) {
            titleFontSize--;
            tempTitle.setFontSize(titleFontSize);
        }

        // 2. Fit Description Height: Shrink description font size until it fits in the remaining space.
        const titleHeight = tempTitle.height;
        const gap = (this.height / 180) * 4; // Scaled gap
        const availableDescHeight = (cardBottomHeight - padding) - titleHeight - gap;

        let tempDesc = this.scene.add.text(0, 0, processedDescription, { font: `${descFontSize}px Arial`, wordWrap: { width: contentWidth } }).setVisible(false);
        while (tempDesc.height > availableDescHeight && descFontSize > minFontSize) {
            descFontSize--;
            tempDesc.setStyle({ font: `${descFontSize}px Arial`, wordWrap: { width: contentWidth } });
        }

        // Create the final description text and anchor it to the bottom of the card.
        this.descriptionText = this.scene.add.text(
            0,
            contentBottomY, // Position its bottom edge at the content boundary.
            processedDescription,
            { font: `${descFontSize}px Arial`, fill: '#333333', align: 'center', wordWrap: { width: contentWidth } }
        ).setOrigin(0.5, 1); // Set origin to bottom-center.
        this.faceContentContainer.add(this.descriptionText);

        // --- Title ---
        // Now create the real title and anchor it right above the description.
        const titleY = this.descriptionText.y - this.descriptionText.height - gap;
        this.titleText = this.scene.add.text(
            0, 
            titleY, 
            this.cardInfo.name, 
            // Note: No wordWrap here to enforce a single line.
            { font: `bold ${titleFontSize}px Arial`, fill: '#000000', align: 'center' }
        ).setOrigin(0.5, 1);
        this.faceContentContainer.add(this.titleText);

        // Clean up temporary text objects
        tempTitle.destroy();
        tempDesc.destroy();
    }

    /**
     * Processes the description string to replace placeholders like {value} with actual card data.
     * @returns {string} The processed description text.
     */
    _getProcessedDescription() {
        let description = this.cardInfo.description || '';
        // Replace any {key} with the value from cardInfo
        description = description.replace(/{(\w+)}/g, (match, key) => {
            // Return the value from cardInfo if it exists, otherwise return the original match (e.g., "{value}")
            return this.cardInfo[key] !== undefined ? this.cardInfo[key] : match;
        });
        return description;
    }

    /**
     * Implements the required method to create a card for the viewscreen.
     */
    createViewscreenCard(options) {
        return new HandCard(this.scene, 0, 0, this.cardId, options);
    }
}
