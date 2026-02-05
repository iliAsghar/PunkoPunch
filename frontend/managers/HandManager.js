/**
 * HandManager - Manages the player's hand of cards
 * Handles display, positioning, animations, and interactions
 */
class HandManager {
    constructor(scene, parentContainer) {
        this.scene = scene;
        this.drawnCards = [];
        this.cardObjects = []; // To hold the Card component instances
        this.cardsContainer = this.scene.add.container(0, 0);
        parentContainer.add(this.cardsContainer);

        // Set a size for the container. This is crucial for making the container itself
        // interactive, which allows us to enable/disable input for all its children at once.
        const { width, height } = scene.game.config;
        this.cardsContainer.setSize(width, height);
        
        // Hand display constants
        this.cardWidth = 120;
        this.cardHeight = 180;
        this.spacing = 135;
        this.curveStrength = 30;
        this.maxRotation = 0.4; // radians (~23 degrees total spread)

        this.playButton = null;
        this.createPlayButton();
    }
    
    /**
     * Add a card to the hand
     */
    addCard(cardId) {
        this.drawnCards.push({ id: cardId, isFlipped: false, selected: false });
        this.display();
    }
    
    /**
     * Remove a card from the hand by index
     */
    removeCard(index) {
        // We only want to remove the data. The card object is destroyed by the animation.
        // The display() call will handle rebuilding the cardObjects array.
        this.drawnCards.splice(index, 1); 
        this.display();
    }

    /**
     * Toggles the selected state of a card in hand and redisplays the hand.
     */
    toggleSelected(index) {
        const wasSelected = this.drawnCards[index].selected;

        // First, unselect all other cards
        this.drawnCards.forEach((cardData, i) => {
            if (i !== index && cardData.selected) {
                cardData.selected = false;
                this.cardObjects[i]?.setSelected(false);
            }
        });

        // Then, toggle the clicked card's state
        const targetCardData = this.drawnCards[index];
        const targetCardObject = this.cardObjects[index];
        if (targetCardData && targetCardObject) {
            targetCardData.selected = !wasSelected;
            targetCardObject.setSelected(targetCardData.selected);
        }

        // Update the play button's visibility and position
        this.updatePlayButton();
    }
    
    /**
     * Get all cards in hand
     */
    getCards() {
        return this.drawnCards;
    }
    
    /**
     * Clear the hand
     */
    clear() {
        this.drawnCards = [];
        this.cardObjects = [];
        this.cardsContainer.each((child) => {
            child.destroy();
        });
        this.cardsContainer.removeAll(true);
    }

    /**
     * Creates the "Play" button, initially hidden.
     */
    createPlayButton() {
        // Position the button to the left of the discard pile for a clean UI layout.
        const { width, height } = this.scene.game.config;
        
        // Calculate discard pile's left edge to align the button next to it.
        const pilePadding = 30; // from PileManager
        const pileWidth = 80;   // from PileManager
        const discardPileX = width - pilePadding - pileWidth / 2;
        const discardPileLeftEdge = discardPileX - (pileWidth / 2);

        const buttonX = discardPileLeftEdge - 100; // Position button with some space
        const buttonY = height - 100; // Align vertically with other UI elements

        this.playButton = this.scene.add.text(0, 0, 'Play', {
            font: 'bold 30px Arial',
            fill: '#ffffff',
            backgroundColor: '#28a745', // A nice green color
            padding: { x: 40, y: 20 },
            borderRadius: 5
        })
        .setOrigin(0.5)
        .setPosition(buttonX, buttonY)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { 
            // Delegate the action to the GameManager
            this.scene.gameManager?.playSelectedCard();
        })
        .on('pointerover', () => {
            // Only show hover effect if the button is enabled
            if (this.playButton.input.enabled) {
                this.playButton.setBackgroundColor('#218838');
            }
        })
        .on('pointerout', () => {
            if (this.playButton.input.enabled) {
                this.playButton.setBackgroundColor('#28a745');
            }
        });

        this.cardsContainer.add(this.playButton);
    }

    /**
     * Updates the visibility and position of the play button.
     */
    updatePlayButton() {
        const selectedIndex = this.drawnCards.findIndex(card => card.selected);

        if (selectedIndex !== -1) {
            // Enable the button
            this.playButton.input.enabled = true;
            this.playButton.setAlpha(1.0);
            this.playButton.setBackgroundColor('#28a745');
        } else {
            // Disable the button
            this.playButton.input.enabled = false;
            this.playButton.setAlpha(0.65);
            // Use a gray color to indicate it's disabled
            this.playButton.setBackgroundColor('#6c757d');
        }
    }
    
    /**
     * Display/re-render the hand with curved layout and rotation
     */
    display() {
        // Update the button state first, as it might be called before cards are drawn
        this.updatePlayButton();

        // Destroy only the old card objects, leaving the playButton intact.
        this.cardObjects.forEach(cardObj => {
            cardObj.destroy();
        });

        // Clear the references and prepare for new card objects
        this.cardObjects = []; // Clear the references
        const cardContainers = []; // To hold the Phaser containers for adding to the scene

        const width = this.scene.game.config.width; // Use base width
        const handY = this.scene.game.config.height - 50; // Use base height
        const cardCount = this.drawnCards.length;
        let currentSpacing = this.spacing;
        
        // If there are 5 or more cards, start reducing the spacing
        if (cardCount >= 5) {
            // The reduction factor determines how much squishing occurs.
            // A higher value means more squish per card.
            const reductionFactor = 15; 
            currentSpacing = this.spacing - (cardCount - 4) * reductionFactor;
            
            // Prevent spacing from becoming too small or negative
            currentSpacing = Math.max(40, currentSpacing);
        }
        
        // Center the hand horizontally
        const totalWidth = (cardCount - 1) * currentSpacing;
        const startX = (width - totalWidth) / 2;
        
        this.drawnCards.forEach((card, index) => {
            const x = startX + index * currentSpacing;
            
            // Create curve effect - cards higher in the middle
            const distFromCenter = Math.abs(index - (cardCount - 1) / 2);
            const y = handY - Math.cos(distFromCenter * 0.5) * this.curveStrength;
            
            // Calculate rotation - cards fan out from center
            const normalizedIndex = index - (cardCount - 1) / 2;
            const rotation = (normalizedIndex / cardCount) * this.maxRotation;
            
            // Create card using Card component
            const cardObj = new Card(this.scene, x, y, card.id, {
                width: this.cardWidth,
                height: this.cardHeight,
                fontSize: 28,
                rotation: rotation,
                interactive: true,
                hoverMoveDistance: 30,  // Move up on hover
                hoverZoom: 1.1,         // Zoom on hover
                isFlipped: card.isFlipped,
                isSelected: card.selected, // Pass the selected state to the card
                onClick: () => {
                    this.toggleSelected(index);
                }
            });
            this.cardObjects.push(cardObj); // Store the Card instance
            cardContainers.push(cardObj.getContainer()); // Store the container for rendering
        });

        this.cardsContainer.add(cardContainers);
    }
    
    /**
     * Get the container for adding to scene
     */
    getContainer() {
        return this.cardsContainer;
    }
}
