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
        this.players = new Map();
        this.playerStatsUIs = new Map();
        this.localPlayerId = 'player1'; // Assuming a local player for now
        this.deathText = null;
    }
    
    /**
     * Initialize the game
     */
    initialize() {
        // Create managers
        this.handManager = new HandManager(this.scene, this.mainContainer);
        this.pileManager = new PileManager(this.scene, this.mainContainer);

        // Create local player
        const player = new Player(this.localPlayerId, 'Player 1', 20, 20, 6, 6);
        this.players.set(this.localPlayerId, player);

        // Create UI for the local player in the top-left corner
        const statsUI = new PlayerStatsUI(this.scene, this.mainContainer, 30, 30);
        statsUI.update(player);
        this.playerStatsUIs.set(this.localPlayerId, statsUI);

        // --- Add Debug Buttons ---
        this.createDebugButtons();
        
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

    /**
     * Creates debug buttons for testing stats.
     */
    createDebugButtons() {
        const buttonY = 30;
        let buttonX = 220; // Start position for buttons, to the right of the stats
        const buttonSpacing = 130;

        // Damage Button
        this.createTestButton(buttonX, buttonY, 'Damage 1', () => this.applyDamage(this.localPlayerId, 1));
        buttonX += buttonSpacing;

        // Heal Button
        this.createTestButton(buttonX, buttonY, 'Heal 1', () => this.applyHeal(this.localPlayerId, 1));
        buttonX = 220; // Reset X for the next row

        // Spend Mana Button
        this.createTestButton(buttonX, buttonY + 40, 'Spend Mana 1', () => this.applyManaCost(this.localPlayerId, 1));
        buttonX += buttonSpacing;

        // Gain Mana Button
        this.createTestButton(buttonX, buttonY + 40, 'Gain Mana 1', () => this.applyManaGain(this.localPlayerId, 1));
    }

    /**
     * Helper to create a simple test button.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {string} text - Button label.
     * @param {function} onClick - Callback function.
     */
    createTestButton(x, y, text, onClick) {
        const btnText = this.scene.add.text(x, y, text, {
            font: '16px Arial',
            fill: '#000',
            backgroundColor: '#ddd',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', onClick)
        .on('pointerover', () => btnText.setBackgroundColor('#bbb'))
        .on('pointerout', () => btnText.setBackgroundColor('#ddd'));

        this.mainContainer.add(btnText);
    }

    /**
     * Applies damage to a player and updates UI.
     * @param {string} playerId 
     * @param {number} amount 
     */
    applyDamage(playerId, amount) {
        const player = this.players.get(playerId);
        if (!player || player.hp <= 0) return;

        player.takeDamage(amount);
        this.playerStatsUIs.get(playerId)?.update(player);

        if (player.hp <= 0) {
            this.handlePlayerDeath(playerId);
        }
    }

    /**
     * Applies healing to a player and updates UI.
     * @param {string} playerId 
     * @param {number} amount 
     */
    applyHeal(playerId, amount) {
        const player = this.players.get(playerId);
        if (!player) return;

        const wasDead = player.hp <= 0;
        player.heal(amount);
        this.playerStatsUIs.get(playerId)?.update(player);

        if (wasDead && player.hp > 0) {
            this.handlePlayerRevive(playerId);
        }
    }
    /**
     * Spends a player's mana and updates UI.
     * @param {string} playerId 
     * @param {number} amount 
     */
    applyManaCost(playerId, amount) {
        const player = this.players.get(playerId);
        if (!player) return;

        if (player.useMana(amount)) {
            this.playerStatsUIs.get(playerId)?.update(player);
        }
    }

    /**
     * Restores a player's mana and updates UI.
     * @param {string} playerId 
     * @param {number} amount 
     */
    applyManaGain(playerId, amount) {
        const player = this.players.get(playerId);
        if (!player) return;

        player.restoreMana(amount);
        this.playerStatsUIs.get(playerId)?.update(player);
    }

    /**
     * Handles the game over state for a player.
     * @param {string} playerId 
     */
    handlePlayerDeath(playerId) {
        // For now, we only handle the local player's death
        if (playerId !== this.localPlayerId) return;

        // Don't do anything if already in the death state
        if (this.deathText) return;

        // Hide game elements
        this.handManager.getContainer().setVisible(false);
        this.pileManager.uiContainer.setVisible(false);

        // Display "YOU'RE DEAD" message
        const { width, height } = this.scene.game.config;
        this.deathText = this.scene.add.text(width / 2, height / 2, "YOU'RE DEAD", {
            font: 'bold 96px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.mainContainer.add(this.deathText);
    }

    /**
     * Handles reviving a player for debugging.
     * @param {string} playerId 
     */
    handlePlayerRevive(playerId) {
        if (playerId !== this.localPlayerId) return;

        // Show game elements
        this.handManager.getContainer().setVisible(true);
        this.pileManager.uiContainer.setVisible(true);

        // Remove "YOU'RE DEAD" message
        if (this.deathText) {
            this.deathText.destroy();
            this.deathText = null;
        }
    }
}
