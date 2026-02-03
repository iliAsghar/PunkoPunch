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
            { id: 'ph10' },
            { id: 'ph11' },
            { id: 'ph12' },
            { id: 'ph13' },
            { id: 'ph14' },
            { id: 'ph15' },
            { id: 'ph16' },
            { id: 'ph17' },
            { id: 'ph18' },
            { id: 'ph19' },
            { id: 'ph20' },
            { id: 'ph21' },
            { id: 'ph22' },
            { id: 'ph23' },
            { id: 'ph24' },
            { id: 'ph25' },
            { id: 'ph26' },
            { id: 'ph27' },
            { id: 'ph28' },
            { id: 'ph29' },
            { id: 'ph30' },
            { id: 'ph31' },
            { id: 'ph32' },
            { id: 'ph33' },
            { id: 'ph34' },
            { id: 'ph35' },
            { id: 'ph36' },
            { id: 'ph37' },
            { id: 'ph38' },
            { id: 'ph39' },
            { id: 'ph40' },
            { id: 'ph41' },
            { id: 'ph42' },
            { id: 'ph43' },
            { id: 'ph44' },
            { id: 'ph45' },
            { id: 'ph46' },
            { id: 'ph47' },
            { id: 'ph48' },
            { id: 'ph49' },
            { id: 'ph50' },
            { id: 'ph51' },
            { id: 'ph52' },
            { id: 'ph53' },
            { id: 'ph54' },
            { id: 'ph55' },
            { id: 'ph56' },
            { id: 'ph57' },
            { id: 'ph58' },
            
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
