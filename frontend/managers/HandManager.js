/**
 * HandManager - Manages the player's hand of cards
 * Handles display, positioning, animations, and interactions
 */
class HandManager {
    constructor(scene, parentContainer) {
        this.scene = scene;
        this.drawnCards = [];
        this.cardsContainer = this.scene.add.container(0, 0);
        parentContainer.add(this.cardsContainer);
        
        // Hand display constants
        this.cardWidth = 120;
        this.cardHeight = 180;
        this.spacing = 135;
        this.curveStrength = 30;
        this.maxRotation = 0.4; // radians (~23 degrees total spread)
    }
    
    /**
     * Add a card to the hand
     */
    addCard(cardId) {
        this.drawnCards.push({ id: cardId });
        this.display();
    }
    
    /**
     * Remove a card from the hand by index
     */
    removeCard(index) {
        this.drawnCards.splice(index, 1);
        this.display();
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
        this.cardsContainer.each((child) => {
            child.destroy();
        });
        this.cardsContainer.removeAll(true);
    }
    
    /**
     * Display/re-render the hand with curved layout and rotation
     */
    display() {
        // Destroy old cards
        this.cardsContainer.each((child) => {
            child.destroy();
        });
        this.cardsContainer.removeAll(true);
        
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
                hoverZoom: 1.1          // Zoom on hover
            });
            
            this.cardsContainer.add(cardObj.getContainer());
        });
    }
    
    /**
     * Get the container for adding to scene
     */
    getContainer() {
        return this.cardsContainer;
    }
}
