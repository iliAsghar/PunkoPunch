/**
 * GameManager - Main orchestrator for game logic
 * Manages interactions between hand and piles
 */
class GameManager {
    constructor(scene, mainContainer) {
        this.scene = scene;
        this.mainContainer = mainContainer;
        this.handManager = null;
        this.pileManager = null;
    }
    
    /**
     * Initialize the game
     */
    initialize() {
        // Create managers
        this.handManager = new HandManager(this.scene, this.mainContainer);
        this.pileManager = new PileManager(this.scene, this.mainContainer);
        
        // Initialize deck with default cards
        const initialDeck = [
            { id: 'ph1' },
            { id: 'ph2' },
            { id: 'ph3' },
            { id: 'ph4' },
            { id: 'ph5' },
            { id: 'ph6' },
            { id: 'ph7' },
            { id: 'ph8' },
            { id: 'ph9' },
            { id: 'ph10' }
        ];
        
        this.pileManager.initialize(initialDeck);
        this.pileManager.createUI();
        
        // Expose to scene for button callbacks
        this.scene.gameManager = this;
    }
    
    /**
     * Draw a card from deck to hand
     */
    drawCard() {
        const card = this.pileManager.drawCard();
        if (card) {
            this.handManager.addCard(card.id);
        }
    }
    
    /**
     * Redraws all major UI components. Called on window resize.
     */
    redrawUI() {
        // This is no longer needed as the main container handles all scaling.
        // The resize logic is now centralized in GameScene.
    }
    
    /**
     * Discard a card from hand to discard pile
     */
    discardCard() {
        if (this.handManager.drawnCards.length > 0) {
            const card = this.handManager.drawnCards.pop();
            this.pileManager.discardCard(card);
            this.handManager.display();
        }
    }
    
    /**
     * Get hand manager
     */
    getHandManager() {
        return this.handManager;
    }
    
    /**
     * Get pile manager
     */
    getPileManager() {
        return this.pileManager;
    }
}
