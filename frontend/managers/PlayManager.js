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
    }

    /**
     * Plays a card from the hand.
     * @param {number} cardIndex The index of the card to play in the hand.
     * @param {object} cardData The data object for the card being played.
     * @param {Card} cardObject The Phaser Card component instance.
     */
    playCard(cardIndex, cardData, cardObject) {
        if (!cardObject) return;

        console.log(`card ${cardData.id} was played`);

        const { width, height } = this.scene.game.config;
        const centerX = width / 2;
        const centerY = height / 2;

        // 1. Reparent the card to the main game container to escape the HandManager's render order.
        const cardContainer = cardObject.getContainer();
        this.scene.gameManager.mainContainer.add(cardContainer);

        // 2. Now, set its depth to bring it to the absolute top layer for the animation.
        cardContainer.setDepth(10);

        // Disable interactions on the card and hand during animation
        cardObject.getContainer().disableInteractive();
        this.handManager.getContainer().disableInteractive();

        // Use a timeline to sequence the animations: move, pause, then shrink.
        const timeline = this.scene.tweens.createTimeline();

        // Part 1: Animate the card to the center of the screen.
        timeline.add({
            targets: cardContainer,
            x: centerX,
            y: centerY,
            rotation: 0, // Straighten the card
            duration: 300,
            ease: 'Power2'
        });

        // Part 2: Animate the card scaling down to zero after a pause.
        timeline.add({
            targets: cardContainer,
            scale: 1.1,
            duration: 30,
            ease: 'Power2.easeIn',
            offset: '+=250' // This creates a 250ms pause after the previous tween completes.
        });

        timeline.add({
            targets: cardContainer,
            scale: 0,
            duration: 150,
            ease: 'Power2.easeIn',
            offset: '+=50'
        });

        // When the entire timeline is finished, update the game state.
        timeline.on('complete', () => {
            // 1. Remove card from hand data
            this.handManager.removeCard(cardIndex);
            // 2. Add card to discard pile
            this.pileManager.discardCard(cardData);
            // 3. Re-enable hand interactions
            this.handManager.getContainer().setInteractive();
        });

        timeline.play();
    }
}