/**
 * GridManager - Manages the central grid of interactive cards.
 * Handles creation, layout, and state of the grid cards.
 */
class GridManager {
    constructor(scene, parentContainer) {
        this.scene = scene;
        this.gridCards = []; // Data model for the grid cards: { id, isFlipped }
        this.cardsContainer = this.scene.add.container(0, 0);
        parentContainer.add(this.cardsContainer);

        // Grid layout constants
        this.rows = 3;
        this.cols = 5;
        this.cardSize = 110; // Square cards
        this.spacing = 20;
    }

    /**
     * Initializes the grid with a set of cards.
     * For now, it pulls randomly from the grid card dictionary.
     */
    initialize() {
        this.gridCards = [];
        const allCards = [
            ...GRID_CARD_DATA.easy,
            ...GRID_CARD_DATA.medium,
            ...GRID_CARD_DATA.hard
        ];

        for (let i = 0; i < this.rows * this.cols; i++) {
            // Get a random card from the available pool
            const randomCardData = allCards[Math.floor(Math.random() * allCards.length)];
            this.gridCards.push({
                id: randomCardData.id,
                isFlipped: false // All cards start face down
            });
        }

        this.display();
    }

    /**
     * Toggles the flipped state of a card in the grid.
     * This is called by the Card's onFlip callback.
     * @param {number} index - The index of the card in the grid.
     */
    toggleFlip(index) {
        if (this.gridCards[index]) {
            // This just updates the data model. The Card component handles its own visual state.
            this.gridCards[index].isFlipped = !this.gridCards[index].isFlipped;
            console.log(`Flipped grid card ${index} to state: ${this.gridCards[index].isFlipped}`);
        }
    }

    /**
     * Renders the grid of cards on the screen.
     */
    display() {
        this.cardsContainer.removeAll(true);

        const gridWidth = this.cols * (this.cardSize + this.spacing) - this.spacing;
        const gridHeight = this.rows * (this.cardSize + this.spacing) - this.spacing;

        // Center the grid on the screen
        const startX = (this.scene.game.config.width - gridWidth) / 2;
        const startY = (this.scene.game.config.height - gridHeight) / 2 - 40; // Shift up slightly

        this.gridCards.forEach((cardData, index) => {
            const col = index % this.cols;
            const row = Math.floor(index / this.cols);

            const x = startX + col * (this.cardSize + this.spacing) + this.cardSize / 2;
            const y = startY + row * (this.cardSize + this.spacing) + this.cardSize / 2;

            // Create a new Card instance for the grid
            const cardObj = new Card(this.scene, x, y, cardData.id, {
                width: this.cardSize,
                height: this.cardSize, // Square card
                fontSize: 48,
                interactive: true,
                isFlipped: cardData.isFlipped, 
                hoverMoveDistance: 0, // Only scale, don't move
                hoverZoom: 1.1,
                // We need to tell the Card component to use the grid dictionary
                cardInfoSource: 'grid',
                // The card will call this function when it's clicked and flipped
                onFlip: () => {
                    this.toggleFlip(index);
                }
            });

            this.cardsContainer.add(cardObj.getContainer());
        });
    }

    getContainer() {
        return this.cardsContainer;
    }
}