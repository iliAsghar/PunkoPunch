/**
 * PlayManager - Handles the logic for playing a card from the hand.
 */
class PlayManager {
    /**
     * @param {Phaser.Scene} scene The current game scene.
     * @param {HandManager} handManager The manager for the player's hand.
     * @param {PileManager} pileManager The manager for the deck and discard piles.
     */
    constructor(scene, handManager, pileManager) {
        this.scene = scene;
        this.handManager = handManager;
        this.pileManager = pileManager;
        this.playQueue = [];
        this.isPlaying = false;
        this.discardQueue = [];
    }

    /**
     * Plays a card from the hand.
     * @param {number} instanceId The unique instance ID of the card to play.
     */
    playCard(instanceId) {
        this.playQueue.push(instanceId);
        this.processPlayQueue();
    }

    /**
     * Animates a card from the hand to the discard pile without playing it.
     * @param {number} instanceId The unique instance ID of the card to discard.
     */
    discardCard(instanceId) {
        this.discardQueue.push(instanceId);
        this.processPlayQueue(); // The same queue processor can handle both
    }

    /**
     * Processes the next card in the play queue if not already playing.
     */
    processPlayQueue() {
        if (this.isPlaying || this.playQueue.length === 0) {
            // If the play queue is empty, check the discard queue.
            if (this.isPlaying || this.discardQueue.length === 0) {
                return;
            }
        }

        this.isPlaying = true;

        // Prioritize playing cards over discarding them.
        const isDiscarding = this.playQueue.length === 0;
        const instanceIdToProcess = isDiscarding ? this.discardQueue.shift() : this.playQueue.shift();

        // Explicitly check for undefined, as instanceId can be 0 (a falsy value).
        if (instanceIdToProcess === undefined) {
            this.isPlaying = false;
            return;
        }

        const cardIndex = this.handManager.drawnCards.findIndex(c => c.instanceId === instanceIdToProcess);
        if (cardIndex === -1) {
            this.isPlaying = false;
            this.processPlayQueue(); // Try the next one
            return;
        }
        const cardData = this.handManager.drawnCards[cardIndex];
        const cardObject = this.handManager.cardObjects[cardIndex];

        if (!isDiscarding) {
            console.log(`card ${cardData.id} was played`);
        }

        // 1. Reparent the card to the main game container to escape the HandManager's render order.
        const cardContainer = cardObject.getContainer();
        this.scene.gameManager.mainContainer.add(cardContainer);

        // 2. Now, set its depth to bring it to the absolute top layer for the animation.
        cardContainer.setDepth(10);

        // Disable interactions on the card and hand during animation
        cardObject.getContainer().disableInteractive();
        this.handManager.getContainer().disableInteractive();

        // --- Trigger the hand reorganization immediately ---
        // This makes the hand smoothly close the gap while the card is animating away.
        this.handManager.animateHandAfterPlay(cardIndex);

        // Get positions for the animation sequence
        const { width, height } = this.scene.game.config;
        const centerX = width / 2;
        const centerY = height / 2;
        const discardPilePosition = this.pileManager.getDiscardPilePosition();

        // Use a timeline to sequence the animations: move to center, pause, then move to discard.
        let timeline;

        if (isDiscarding) {
            // Simple animation: directly to the discard pile.
            timeline = this.scene.tweens.add({
                targets: cardContainer,
                x: discardPilePosition.x,
                y: discardPilePosition.y,
                rotation: Phaser.Math.DegToRad(45),
                scale: 0,
                duration: 400,
                ease: 'Cubic.easeIn'
            });
        } else {
            // Full "play card" animation with timeline.
            timeline = this.scene.tweens.createTimeline();

            // Part 1: Animate the card to the center of the screen.
            timeline.add({
                targets: cardContainer,
                x: centerX,
                y: centerY,
                rotation: 0, // Straighten the card
                scale: 1.1,  // Slightly enlarge it for focus
                duration: 300,
                ease: 'Power2'
            });

            // Part 2: Add a "thump" or "pulse" effect after it arrives.
            timeline.add({
                targets: cardContainer,
                scale: 1.0, // Scale down slightly from 1.1
                duration: 100,
                ease: 'Power1',
                yoyo: true, // This makes it automatically scale back up to 1.1
                offset: '+=50' // Start this animation slightly before the previous one ends for a smoother feel.
            });

            // Part 3: Animate the card to the discard pile while shrinking and rotating.
            timeline.add({
                targets: cardContainer,
                x: discardPilePosition.x,
                y: discardPilePosition.y,
                rotation: Phaser.Math.DegToRad(45),
                scale: 0, // Shrink to nothing
                duration: 400,
                ease: 'Cubic.easeIn',
                offset: '+=500' // This creates a 500ms pause after the "thump" animation.
            });

            timeline.play();
        }

        timeline.on('complete', () => {
            // The order here is critical to prevent race conditions, especially with the last card.
            // First, perform all data and model updates.
            cardContainer.destroy();
            this.pileManager.discardCard(cardData);

            // Then, re-enable interactions.
            this.handManager.getContainer().setInteractive();

            // Finally, update the play state and check for the next action in the queue.
            // This must be last to ensure all other managers have a consistent state.
            this.isPlaying = false;
            this.processPlayQueue();

            // After attempting to process the next item, check if all queues are now empty.
            // If so, and a bulk operation was in progress, we can now end it.
            if (!this.isPlaying && this.playQueue.length === 0 && this.discardQueue.length === 0) {
                if (this.scene.gameManager.isBulkOperationInProgress) {
                    this.scene.gameManager.isBulkOperationInProgress = false;
                    this.scene.events.emit('bulkDiscardComplete'); // Signal that the bulk operation is done.
                }
            }
        });

    }

}