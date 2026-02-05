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
     * Processes the next card in the play queue if not already playing.
     */
    processPlayQueue() {
        if (this.isPlaying || this.playQueue.length === 0) {
            return;
        }

        this.isPlaying = true;
        const instanceIdToPlay = this.playQueue.shift();

        // --- Find the card in the hand at the moment of playing ---
        // This is the crucial fix: we find the card's current index and object
        // right before we animate it, avoiding stale data.
        const cardIndex = this.handManager.drawnCards.findIndex(c => c.instanceId === instanceIdToPlay);
        if (cardIndex === -1) {
            this.isPlaying = false;
            this.processPlayQueue(); // Try the next one
            return;
        }
        const cardData = this.handManager.drawnCards[cardIndex];
        const cardObject = this.handManager.cardObjects[cardIndex];

        console.log(`card ${cardData.id} was played`);

        // 1. Reparent the card to the main game container to escape the HandManager's render order.
        const cardContainer = cardObject.getContainer();
        this.scene.gameManager.mainContainer.add(cardContainer);

        // 2. Now, set its depth to bring it to the absolute top layer for the animation.
        cardContainer.setDepth(10);

        // Disable interactions on the card and hand during animation
        cardObject.getContainer().disableInteractive();
        this.handManager.getContainer().disableInteractive();

        // Get positions for the animation sequence
        const { width, height } = this.scene.game.config;
        const centerX = width / 2;
        const centerY = height / 2;
        const discardPilePosition = this.pileManager.getDiscardPilePosition();

        // Use a timeline to sequence the animations: move to center, pause, then move to discard.
        const timeline = this.scene.tweens.createTimeline();

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

        // Part 2: Animate the card to the discard pile while shrinking and rotating.
        timeline.add({
            targets: cardContainer,
            x: discardPilePosition.x,
            y: discardPilePosition.y,
            rotation: Phaser.Math.DegToRad(45),
            scale: 0, // Shrink to nothing
            duration: 400,
            ease: 'Cubic.easeIn',
            offset: '+=250' // This creates a 250ms pause after the first tween.
        });

        timeline.on('complete', () => {
            // 1. Destroy the card's container after the animation is done.
            cardContainer.destroy();
            // 2. Animate the hand closing the gap.
            this.handManager.animateHandAfterPlay(cardIndex);
            // 3. Add card to discard pile
            this.pileManager.discardCard(cardData);
            // 4. Re-enable hand interactions.
            this.handManager.getContainer().setInteractive();

            // We are no longer playing, so we can process the next item in the queue.
            this.isPlaying = false;
            this.processPlayQueue();
        });

        timeline.play();
    }

}