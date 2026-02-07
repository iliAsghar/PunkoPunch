/**
 * GameManager - Main orchestrator for game logic
 * Manages interactions between hand and piles
 */
class GameManager {
    constructor(scene, mainContainer, gameSettings = {}) {
        this.scene = scene;
        this.mainContainer = mainContainer;
        this.maxPlayersPerTeam = gameSettings.maxPlayersPerTeam || 2; // Default to 2 if not set
        this.debugMode = gameSettings.debugMode || false;
        this.handManager = null;
        this.turnManager = null;
        this.pileManager = null;
        this.playManager = null;
        this.gridManager = null;
        this.effectManager = null;
        this.players = new Map();
        this.playerStatsUIs = new Map();
        this.teamUIs = new Map(); // For the new side-panel team UI
        this.localPlayerId = 'player1'; // Assuming a local player for now
        this.isBulkOperationInProgress = false; // To lock actions during 'Discard All'
        this.targetingState = null; // To manage card targeting
        this.deathText = null;
    }
    
    /**
     * Initialize the game
     */
    initialize() {
        // Expose the GameManager to the scene immediately so other managers can access it.
        this.scene.gameManager = this;

        // Listen for the event that signals the end of the discard-all animation.
        this.scene.events.on('bulkDiscardComplete', () => {
            if (this.turnManager.isTurnEnding) {
                this.turnManager.isTurnEnding = false;
                this.turnManager.startTurn();
            }
        });
        // Listen for the event that signals the end of a card draw animation.
        this.scene.events.on('drawComplete', () => {
            this.turnManager.resumeTimer();
        });

        // Create managers
        // Create a dedicated container for the hand so we can disable it independently.
        const handContainer = this.scene.add.container(0, 0);
        this.mainContainer.add(handContainer);
        this.handManager = new HandManager(this.scene, handContainer);
        this.turnManager = new TurnManager(this.scene, this);
        this.pileManager = new PileManager(this.scene, this.mainContainer);
        this.playManager = new PlayManager(this.scene, this.handManager, this.pileManager);
        this.effectManager = new EffectManager(this);
        this.gridManager = new GridManager(this.scene, this.mainContainer, {
            rows: this.maxPlayersPerTeam + 1,
            cols: 7
        });

        // Create UI for the local player in the top-left corner
        const statsUI = new PlayerStatsUI(this.scene, this.mainContainer, 30, 30);
        statsUI.update(this.players.get(this.localPlayerId));
        this.playerStatsUIs.set(this.localPlayerId, statsUI);

        this.turnManager.initialize();

        // Initialize grid first to get its dimensions for layout.
        this.gridManager.initialize();

        this.initializePlayersAndTeams();

        // --- Add Debug Buttons (if in debug mode) ---
        if (this.debugMode) {
            this.createDebugButtons();
        }
        
        // Initialize deck using the loaded deck definition.
        // DECK1_CARD_IDS is globally available from frontend/decks/deck1.js
        const initialDeck = DECK1_CARD_IDS.map(cardId => ({
            id: cardId
        }));
        this.pileManager.initialize(initialDeck);
        this.pileManager.createUI();

        // Start the first turn via the TurnManager.
        this.turnManager.startTurn();
    }

    /**
     * Creates all player instances, assigns them to teams, and creates the team UI panels.
     */
    initializePlayersAndTeams() {
        // Team A (Left side)
        for (let i = 1; i <= this.maxPlayersPerTeam; i++) {
            const playerId = `player${i}`;
            const player = new Player(playerId, `Player ${i}`, 20, 20, 6, 6);
            player.team = 'A';
            this.players.set(playerId, player);
        }

        // Team B (Right side)
        for (let i = 1; i <= this.maxPlayersPerTeam; i++) {
            const playerId = `opponent${i}`;
            const player = new Player(playerId, `Opponent ${i}`, 20, 20, 6, 6);
            player.team = 'B';
            this.players.set(playerId, player);
        }

        // Position team UIs relative to the grid
        const gridBounds = this.gridManager.getGridBounds();
        const teamUIPadding = 20;
        const teamUIWidth = 180; // From TeamMemberUI

        // Calculate the total height of one team's UI panel
        const memberHeight = 60;
        const memberSpacing = 15;
        const teamUIHeight = (this.maxPlayersPerTeam * memberHeight) + Math.max(0, this.maxPlayersPerTeam - 1) * memberSpacing;

        // Calculate positions to center the team UI vertically with the grid
        const teamAX = gridBounds.x - teamUIWidth - teamUIPadding;
        const teamBX = gridBounds.x + gridBounds.width + teamUIPadding;
        const teamY = gridBounds.y + (gridBounds.height - teamUIHeight) / 2;

        this.createTeamUI('A', teamAX, teamY); // Team A on the left of the grid
        this.createTeamUI('B', teamBX, teamY); // Team B on the right of the grid

        this.playerStatsUIs.get(this.localPlayerId)?.update(this.players.get(this.localPlayerId));
    }

    /**
     * Creates the UI container and individual member UIs for a given team.
     * @param {string} teamId 'A' or 'B'
     * @param {number} x The horizontal position for the team's UI container.
     * @param {number} y The vertical position for the team's UI container.
     */
    createTeamUI(teamId, x, y) {
        const teamContainer = this.scene.add.container(x, y);
        this.mainContainer.add(teamContainer);

        const teamPlayers = Array.from(this.players.values()).filter(p => p.team === teamId);

        teamPlayers.forEach((player, index) => {
            const y = index * (60 + 15); // 60px height + 15px spacing
            const memberUI = new TeamMemberUI(this.scene, teamContainer, 0, y);
            const isCurrentPlayer = player.playerId === this.localPlayerId;
            memberUI.update(player, isCurrentPlayer);

            // Add targeting interaction
            memberUI.getContainer().on('pointerdown', () => this.onTargetSelected(player));
            memberUI.getContainer().on('pointerover', () => this.onTargetHover(memberUI, player, true));
            memberUI.getContainer().on('pointerout', () => this.onTargetHover(memberUI, player, false));
            // Store the UI component to update it later
            this.teamUIs.set(player.playerId, memberUI);
        });
    }
    
    /**
     * Draw a card from deck to hand
     * @param {number} [count=1] - The number of cards to draw.
     */
    drawCard(count = 1) {
        // Prevent drawing if a bulk operation or another draw is already in progress.
        if (this.isBulkOperationInProgress) return;
 
        // If we are about to start drawing, pause the timer.
        if (count > 0 && this.handManager.isDrawing) {
            this.turnManager.pauseTimer();
        }

        // Queue up the requested number of draws.
        for (let i = 0; i < count; i++) {
            this.handManager.drawCardWithAnimation();
        }
    }
    
    /**
     * Finds the selected card in hand and tells the PlayManager to play it.
     */
    playSelectedCard() {
        // If we are already in targeting mode, do nothing.
        if (this.targetingState) {
            return;
        }

        const selectedIndex = this.handManager.drawnCards.findIndex(card => card.selected);

        if (selectedIndex !== -1) {
            const player = this.players.get(this.localPlayerId);
            const cardData = this.handManager.drawnCards[selectedIndex];
            const cardInfo = getCardInfo(cardData.id);
            const manaCost = cardInfo.cost?.mana || 0;

            // Check if the player can afford the card.
            if (player.mana >= manaCost) {
                // Pause the timer while the card is being played.
                this.turnManager.pauseTimer();
                this.enterTargetingMode(cardData, cardInfo);
            } else {
                // Not enough mana. For now, we just log it.
                // The button will also be disabled, providing visual feedback.
                console.log(`Not enough mana to play ${cardInfo.name}. Needs ${manaCost}, has ${player.mana}.`);
            }
        }
    }

    /**
     * Enters targeting mode for a card that requires a target.
     * @param {object} cardData The card data from the hand.
     * @param {object} cardInfo The static card info from the dictionary.
     */
    enterTargetingMode(cardData, cardInfo) {
        const { target_type, target_scope } = cardInfo;

        // If the card is global, it has no target. Play it immediately.
        if (target_type === 'global' || !target_type) {
            this.executePlay(cardData, cardInfo, null);
            return;
        }

        // Set the targeting state.
        this.targetingState = { cardData, cardInfo };
        console.log(`Entering targeting mode for ${cardInfo.name}. Target type: ${target_type}, scope: ${target_scope}.`);

        // Disable the hand and play/end turn buttons.
        this.handManager.getContainer().disableInteractive();
        this.handManager.playButton.disableInteractive();
        this.handManager.endTurnButton.disableInteractive();

        // Highlight valid targets.
        this.updateTargetHighlights();

        // TODO: Add a "Cancel" button or allow right-click to cancel.
    }

    /**
     * Called when a player clicks on a potential target (e.g., a TeamMemberUI).
     * @param {Player} targetPlayer The player object that was clicked.
     */
    onTargetSelected(targetPlayer) {
        if (!this.targetingState) return;

        const { cardInfo } = this.targetingState;

        if (this.isValidTarget(targetPlayer, cardInfo.target_scope)) {
            console.log(`Selected target: ${targetPlayer.name}`);
            this.executePlay(this.targetingState.cardData, cardInfo, targetPlayer);
        } else {
            console.log(`${targetPlayer.name} is not a valid target.`);
            // TODO: Add visual feedback for invalid target clicks (e.g., a "buzz" sound or red flash).
        }
    }

    /**
     * Executes the card play logic after a target has been selected (or if no target was needed).
     * @param {object} cardData The card data from the hand.
     * @param {object} cardInfo The static card info.
     * @param {Player | null} target The selected target, or null for global cards.
     */
    executePlay(cardData, cardInfo, target) {
        // Spend the mana.
        this.applyManaCost(this.localPlayerId, cardInfo.cost?.mana || 0);

        // Execute the card's specific play function.
        cardInfo.play(this, target);

        // Clear the selection *before* queueing the card to be played.
        this.handManager.clearSelection();
        this.playManager.playCard(cardData.instanceId);

        // Exit targeting mode.
        this.exitTargetingMode();
    }

    /**
     * Resets the game state after targeting is complete or cancelled.
     */
    exitTargetingMode() {
        this.targetingState = null;
        this.handManager.getContainer().setInteractive();
        this.handManager.playButton.setInteractive();
        this.handManager.endTurnButton.setInteractive();
        this.clearAllTargetHighlights(); // This will clear all highlights.
    }

    /**
     * Checks if a player is a valid target based on the card's scope.
     * @param {Player} targetPlayer The player to check.
     * @param {string} scope The required scope ('ally', 'enemy', 'any').
     * @returns {boolean}
     */
    isValidTarget(targetPlayer, scope) {
        const localPlayer = this.players.get(this.localPlayerId);
        if (scope === 'ally') return targetPlayer.team === localPlayer.team;
        if (scope === 'enemy') return targetPlayer.team !== localPlayer.team;
        if (scope === 'any') return true;
        return false;
    }

    /**
     * Updates the visual highlight on all potential targets.
     */
    updateTargetHighlights() {
        const scope = this.targetingState?.cardInfo.target_scope;
        this.teamUIs.forEach((ui, playerId) => {
            const player = this.players.get(playerId);
            const isValid = this.targetingState ? this.isValidTarget(player, scope) : false;
            ui.setHighlight(isValid, 'target');
        });
    }

    /**
     * Forcefully removes all 'target' and 'hover' highlights from all team UIs.
     * Called when exiting targeting mode.
     */
    clearAllTargetHighlights() {
        this.teamUIs.forEach(ui => {
            ui.clearAllHighlights();
        });
    }
    onTargetHover(memberUI, player, isHovering) {
        if (!this.targetingState) return;

        const scope = this.targetingState.cardInfo.target_scope;
        if (this.isValidTarget(player, scope)) {
            memberUI.setHighlight(isHovering, 'hover');
        }
    }

    /**
     * Finds the selected card in hand and tells the PlayManager to discard it.
     */
    discardSelectedCard() {
        // Prevent discarding if a bulk operation is in progress.
        if (this.isBulkOperationInProgress) return;

        const selectedIndex = this.handManager.drawnCards.findIndex(card => card.selected);

        if (selectedIndex !== -1) {
            const cardData = this.handManager.drawnCards[selectedIndex];

            // Clear the selection *before* queueing the card to be discarded.
            this.handManager.clearSelection();
            this.playManager.discardCard(cardData.instanceId);
        }
    }

    /**
     * Queues all cards in the hand to be discarded.
     */
    discardAllCards() {
        // Prevent starting a new bulk operation if one is already running.
        if (this.isBulkOperationInProgress) return;

        const hand = this.handManager.getCards();
        if (hand.length > 0) {
            // Set the flag to block other actions.
            this.isBulkOperationInProgress = true;

            // First, find and unselect any selected card. This must happen before
            // we start queueing discards to prevent visual glitches.
            this.handManager.clearSelection();

            // Now, queue all cards for discard, from right-to-left for a better visual effect.
            const cardsToDiscard = [...hand].reverse();
            cardsToDiscard.forEach(cardData => {
                this.playManager.discardCard(cardData.instanceId);
            });
        } else if (this.turnManager.isTurnEnding) {
            // If hand is empty but we are ending the turn, we still need to trigger the next turn.
            // We can do this by directly calling the startTurn sequence.
            this.turnManager.isTurnEnding = false;
            this.turnManager.startTurn();
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
     * Get grid manager
     */
    getGridManager() {
        return this.gridManager;
    }

    /**
     * Creates debug buttons for testing stats.
     */
    createDebugButtons() {
        let buttonY = 10; // Start position from the top
        const buttonX = 10; // Start position from the left
        const buttonSpacing = 30; // Vertical spacing between buttons

        // Damage Button
        this.createTestButton(buttonX, buttonY, 'Damage 1', () => this.applyDamage(this.localPlayerId, 1), true);
        buttonY += buttonSpacing;

        // Heal Button
        this.createTestButton(buttonX, buttonY, 'Heal 1', () => this.applyHeal(this.localPlayerId, 1), true);
        buttonY += buttonSpacing;

        // Spend Mana Button
        this.createTestButton(buttonX, buttonY, 'Spend Mana 1', () => this.applyManaCost(this.localPlayerId, 1), true);
        buttonY += buttonSpacing;

        // Gain Mana Button
        this.createTestButton(buttonX, buttonY, 'Gain Mana 1', () => this.applyManaGain(this.localPlayerId, 1), true);
        buttonY += buttonSpacing;

        // Draw 1 Card Button
        this.createTestButton(buttonX, buttonY, 'Draw 1 Card', () => this.drawCard(1), true);
        buttonY += buttonSpacing;

        // Draw 5 Cards Button
        this.createTestButton(buttonX, buttonY, 'Draw 5 Cards', () => this.drawCard(5), true);
        buttonY += buttonSpacing;

        // Discard Selected Button
        this.createTestButton(buttonX, buttonY, 'Discard Selected', () => this.discardSelectedCard(), true);
        buttonY += buttonSpacing;

        // Discard All Button
        this.createTestButton(buttonX, buttonY, 'Discard All', () => this.discardAllCards(), true);
        buttonY += buttonSpacing;
    }

    /**
     * Helper to create a simple test button.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     * @param {string} text - Button label.
     * @param {function} onClick - Callback function.
     * @param {boolean} [isSmall=false] - Whether to use smaller styling.
     */
    createTestButton(x, y, text, onClick, isSmall = false) {
        const btnText = this.scene.add.text(x, y, text, {
            font: isSmall ? '12px Arial' : '16px Arial',
            fill: '#000',
            backgroundColor: '#ddd',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) return;
            onClick();
        })
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
        
        // Update the new team UI as well
        const isCurrentPlayer = playerId === this.localPlayerId;
        this.teamUIs.get(playerId)?.update(player, isCurrentPlayer);


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

        // Update the new team UI as well
        const isCurrentPlayer = playerId === this.localPlayerId;
        this.teamUIs.get(playerId)?.update(player, isCurrentPlayer);

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
     * Animates the mana gain for a player at the start of the turn.
     * @param {string} playerId The ID of the player whose mana should be refilled.
     */
    animateManaRefill(playerId) {
        const player = this.players.get(playerId);
        const statsUI = this.playerStatsUIs.get(playerId);
        if (!player || !statsUI) return;

        const startMana = player.mana;
        const endMana = player.maxMana;

        // If mana is already full, just update the model and UI and exit.
        if (startMana >= endMana) {
            player.restoreMana(endMana); // This just clamps it to max.
            statsUI.update(player);
            return;
        }

        // Update the data model instantly.
        player.restoreMana(endMana);

        // Create a temporary object to tween its value for the animation.
        let counter = { value: startMana };

        this.scene.tweens.add({
            targets: counter,
            value: endMana,
            duration: 600, // Animation duration in ms
            ease: 'Power1',
            onUpdate: () => {
                // On each frame of the tween, update the mana text display.
                statsUI.updateManaText(counter.value, player.maxMana);
            },
            onComplete: () => {
                // After the animation, ensure the final count is perfectly accurate.
                statsUI.update(player);
            }
        });
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

        // Stop the turn timer.
        this.turnManager.freezeTimerOnDeath();

        // Instantly clear the player's hand.
        this.handManager.emptyHandInstantly();

        // Hide game elements
        this.handManager.getContainer().setVisible(false);
        this.pileManager.uiContainer.setVisible(false);
        this.gridManager.cardsContainer.setVisible(false);

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
        this.gridManager.cardsContainer.setVisible(true);
        // Remove "YOU'RE DEAD" message
        if (this.deathText) {
            this.deathText.destroy();
            this.deathText = null;
        }

        // Give the revived player a fresh start with a new turn.
        this.turnManager.startTurn();
    }
}
