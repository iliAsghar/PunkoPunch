/**
 * TurnManager - Handles the game's turn structure, timer, and flow.
 */
class TurnManager {
    constructor(scene, gameManager) {
        this.scene = scene;
        this.gameManager = gameManager;

        this.turn = 0;
        this.turnCounterText = null;
        this.turnDuration = 15; // seconds
        this.turnTimer = null; // Phaser.Time.TimerEvent
        this.turnTimerText = null;
        this.isTurnEnding = false;
    }

    /**
     * Creates the UI elements for the turn counter and timer.
     */
    initialize() {
        const { width } = this.scene.game.config;

        // --- Add Turn Counter ---
        this.turnCounterText = this.scene.add.text(width / 2, 40, `Turn: ${this.turn}`, {
            font: 'bold 32px Arial',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        this.gameManager.mainContainer.add(this.turnCounterText);

        // --- Add Turn Timer ---
        this.turnTimerText = this.scene.add.text(width - 100, 40, `Time: ${this.turnDuration}s`, {
            font: 'bold 32px Arial',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        this.gameManager.mainContainer.add(this.turnTimerText);
    }

    /**
     * Starts a new turn for the player.
     */
    startTurn() {
        // Stop any previous timer that might be running.
        if (this.turnTimer) {
            this.turnTimer.destroy();
        }

        // Reset timer display and start a new one.
        this.turnTimerText.setText(`Time: ${this.turnDuration}s`);
        this.turnTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.tick,
            callbackScope: this,
            repeat: this.turnDuration - 1, // repeat N-1 times for N total calls
            paused: true // Start paused, will be resumed after initial draw
        });

        this.turn++;
        console.log(`Starting Turn ${this.turn}`);
        this.turnCounterText.setText(`Turn: ${this.turn}`);

        // Refill mana for the local player at the start of the turn.
        this.gameManager.animateManaRefill(this.gameManager.localPlayerId);

        // At the start of the turn, draw 5 cards.
        this.gameManager.drawCard(5);
        // Make sure the End Turn button is enabled.
        this.gameManager.handManager.updateEndTurnButton(true);
    }

    /**
     * Initiates the end-of-turn sequence.
     */
    endTurn() {
        // Don't allow ending the turn if a bulk operation is already happening.
        if (this.isTurnEnding) return;

        // Stop the timer as soon as the turn ends.
        if (this.turnTimer) {
            this.turnTimer.destroy();
        }
        if (this.gameManager.isBulkOperationInProgress) return;

        console.log(`Ending Turn ${this.turn}`);
        this.isTurnEnding = true;
        this.gameManager.handManager.updateEndTurnButton(false); // Disable button immediately.
        this.gameManager.discardAllCards();
    }

    /**
     * Callback function for the turn timer, called every second.
     */
    tick() {
        // The timer's repeat count is the number of remaining repeats.
        // It counts down from (duration - 1) to 0.
        const remainingTime = this.turnTimer.getRepeatCount() + 1;
        this.turnTimerText.setText(`Time: ${remainingTime - 1}s`);

        if (remainingTime <= 1) {
            this.endTurn();
        }
    }

    /**
     * Pauses the turn timer if it's active.
     */
    pauseTimer() {
        if (this.turnTimer) this.turnTimer.paused = true;
    }

    /**
     * Resumes the turn timer if it's active and no other animations are running.
     */
    resumeTimer() {
        if (this.turnTimer && !this.gameManager.handManager.isDrawing && !this.gameManager.playManager.isPlaying) {
            this.turnTimer.paused = false;
        }
    }

    /**
     * Stops the timer completely and sets the display to 0, e.g., on player death.
     */
    freezeTimerOnDeath() {
        if (this.turnTimer) {
            this.turnTimer.destroy();
            this.turnTimer = null;
        }
        this.turnTimerText.setText('Time: 0s');
    }
}