/**
 * GridManager - Manages the central grid of interactive cards.
 * Handles creation, layout, and state of the grid cards.
 */
class GridManager {
    constructor(scene, parentContainer, options = {}) {
        this.scene = scene;
        this.gridCards = []; // Data model for the grid cards: { id, isFlipped }
        this.cardsContainer = this.scene.add.container(0, 0);
        parentContainer.add(this.cardsContainer);

        // Grid layout constants
        this.rows = options.rows || 3; // Default to 3 rows
        this.cols = options.cols || 5; // Default to 5 columns
        this.cardSize = 70; // Square cards
        this.spacing = 10;
    }

    /**
     * Initializes the grid with a set of cards.
     * For now, it pulls randomly from the grid card dictionary.
     */
    initialize() {
        this.gridCards = [];
        const centerCol = Math.floor(this.cols / 2);

        for (let i = 0; i < this.rows * this.cols; i++) {
            const col = i % this.cols;
            let cardPool;

            // Determine which card pool to use based on the column
            if (col === centerCol) {
                cardPool = GRID_CARD_DATA.hard;
            } else if (Math.abs(col - centerCol) === 1) {
                cardPool = GRID_CARD_DATA.medium;
            } else {
                cardPool = GRID_CARD_DATA.easy;
            }

            // Get a random card from the selected pool
            const randomCardData = cardPool[Math.floor(Math.random() * cardPool.length)];
            this.gridCards.push({
                id: randomCardData.id,
                isFlipped: true // All cards start face down
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
            const cardObj = new GridCard(this.scene, x, y, cardData.id, {
                isFlipped: cardData.isFlipped, 
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