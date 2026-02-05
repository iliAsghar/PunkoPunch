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

        this.drawQueue = [];
        this.nextCardInstanceId = 0;
        this.isDrawing = false;

        this.playButton = null;
        this.discardSelectedButton = null;
        this.discardAllButton = null;
        this.createActionButtons();
    }
    
    /**
     * Add a card to the hand
     */
    addCard(cardId) {
        // This now bypasses animation. Use drawCardWithAnimation for animated drawing.
        this.drawnCards.push({
            instanceId: this.nextCardInstanceId++,
            id: cardId,
            isFlipped: false,
            selected: false
        });
        this.reorganizeHand();
    }
    
    /**
     * Remove a card from the hand by index
     */
    removeCard(index) {
        // This is now primarily for non-play actions. For playing cards,
        // use animateHandAfterPlay for a smoother transition.
        this.animateHandAfterPlay(index);
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
        this.updateActionButtonsState();
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
    createActionButtons() {
        const { width, height } = this.scene.game.config;
        
        // Calculate discard pile position to align the buttons.
        const pilePadding = 30; // from PileManager
        const pileWidth = 80;   // from PileManager
        const pileHeight = 120; // from PileManager
        const discardPileX = width - pilePadding - pileWidth / 2;
        const discardPileY = height - pilePadding - pileHeight / 2;

        // --- Play Button ---
        const playButtonX = discardPileX - 150; // Position to the left of the discard pile
        const playButtonY = height - 100;
        this.playButton = this.scene.add.text(0, 0, 'Play', {
            font: 'bold 30px Arial',
            fill: '#ffffff',
            backgroundColor: '#28a745',
            padding: { x: 40, y: 20 },
            borderRadius: 5
        })
        .setOrigin(0.5)
        .setPosition(playButtonX, playButtonY)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.gameManager?.playSelectedCard())
        .on('pointerover', () => {
            if (this.playButton.input.enabled) {
                this.playButton.setBackgroundColor('#218838');
            }
        })
        .on('pointerout', () => {
            this.playButton.setBackgroundColor('#28a745');
        });

        // --- Discard Selected Button ---
        const discardSelectedBtnX = discardPileX;
        const discardBtnY = discardPileY - pileHeight / 2 - 85; // Position above the other discard button
        this.discardSelectedButton = this.scene.add.text(0, 0, 'Discard Selected', {
            font: 'bold 12px Arial',
            fill: '#ffffff',
            backgroundColor: '#dc3545', // Red color for discard
            padding: { x: 10, y: 9 },
            borderRadius: 3
        })
        .setOrigin(0.5)
        .setPosition(discardSelectedBtnX, discardBtnY)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.gameManager?.discardSelectedCard())
        .on('pointerover', () => {
            if (this.discardSelectedButton.input.enabled) {
                this.discardSelectedButton.setBackgroundColor('#c82333');
            }
        })
        .on('pointerout', () => {
            this.discardSelectedButton.setBackgroundColor('#dc3545');
        });

        // --- Discard All Button ---
        const discardAllBtnX = discardPileX;
        const discardAllBtnY = discardBtnY - 35; // Position above 'Discard Selected'
        this.discardAllButton = this.scene.add.text(0, 0, 'Discard All', {
            font: 'bold 12px Arial',
            fill: '#ffffff',
            backgroundColor: '#dc3545', // Red color for discard
            padding: { x: 21, y: 9 },
            borderRadius: 3
        })
        .setOrigin(0.5)
        .setPosition(discardAllBtnX, discardAllBtnY)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.gameManager?.discardAllCards())
        .on('pointerover', () => {
            if (this.discardAllButton.input.enabled) {
                this.discardAllButton.setBackgroundColor('#c82333');
            }
        })
        .on('pointerout', () => this.discardAllButton.setBackgroundColor('#dc3545'));

        this.cardsContainer.add([this.playButton, this.discardSelectedButton, this.discardAllButton]);
        this.updateActionButtonsState(); // Set initial state
    }

    /**
     * Updates the visibility and position of the play button.
     */
    updateActionButtonsState() {
        // The button should always be visible; its state is handled by updatePlayButton.
        this.playButton.setVisible(true);
        this.discardSelectedButton.setVisible(true);
        this.discardAllButton.setVisible(true);
    }

    /**
     * Updates the visibility and state of the play button.
     */
    updatePlayButton() {
        const selectedIndex = this.drawnCards.findIndex(card => card.selected);
        const handHasCards = this.drawnCards.length > 0;

        if (selectedIndex !== -1) {
            // Enable the button
            this.playButton.setAlpha(1.0);
            this.playButton.input.enabled = true;
            this.playButton.setBackgroundColor('#28a745');

            this.discardSelectedButton.setAlpha(1.0);
            this.discardSelectedButton.input.enabled = true;
            this.discardSelectedButton.setBackgroundColor('#dc3545');
        } else {
            // Disable the button
            this.playButton.setAlpha(0.65);
            this.playButton.input.enabled = false;
            this.playButton.setBackgroundColor('#6c757d');

            this.discardSelectedButton.setAlpha(0.65);
            this.discardSelectedButton.input.enabled = false;
            this.discardSelectedButton.setBackgroundColor('#6c757d');
        }

        // Update "Discard All" button state based on whether there are cards in hand
        if (handHasCards) {
            this.discardAllButton.setAlpha(1.0);
            this.discardAllButton.input.enabled = true;
            this.discardAllButton.setBackgroundColor('#dc3545');
        } else {
            this.discardAllButton.setAlpha(0.65);
            this.discardAllButton.input.enabled = false;
            this.discardAllButton.setBackgroundColor('#6c757d');
        }
    }
    
    /**
     * Display/re-render the hand with curved layout and rotation
     */
    display() {
        this.updateActionButtonsState();
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
     * Animates the hand to fill the gap left by a played/removed card.
     * @param {number} removedIndex The index of the card that was removed.
     */
    animateHandAfterPlay(removedIndex) {
        // Update the data model first. The card object was already destroyed by its animation.
        this.drawnCards.splice(removedIndex, 1);
        this.cardObjects.splice(removedIndex, 1);

        // Animate the remaining cards to their new positions.
        this.reorganizeHand();
    }

    /**
     * Populates the hand with an initial set of cards and displays them without animation.
     * @param {string[]} cardIds An array of card IDs to add to the hand.
     */
    drawInitialHand(cardIds) {
        cardIds.forEach(cardId => {
            this.drawnCards.push({
                instanceId: this.nextCardInstanceId++,
                id: cardId,
                isFlipped: false,
                selected: false
            });
        });
        // Use the synchronous display method to render the full hand correctly.
        this.display();
    }

    /**
     * Animates drawing a card from the deck pile into the hand.
     * @param {string} cardId The ID of the card being drawn.
     */
    drawCardWithAnimation(cardId) {
        this.drawQueue.push(cardId);
        this.processDrawQueue();
    }

    /**
     * Processes the next card in the draw queue if not already drawing.
     */
    processDrawQueue() {
        if (this.isDrawing || this.drawQueue.length === 0) {
            return;
        }

        this.isDrawing = true;
        const cardId = this.drawQueue.shift();

        const pileManager = this.scene.gameManager.getPileManager();
        const startPos = pileManager.getDeckPosition();

        // Create a temporary card for the animation.
        const tempCard = new Card(this.scene, startPos.x, startPos.y, cardId, {
            width: this.cardWidth,
            height: this.cardHeight,
            interactive: false,
        });
        
        // Add it to the main container so it's on top of the hand during animation.
        this.scene.gameManager.mainContainer.add(tempCard.getContainer());
        tempCard.getContainer().setDepth(5); // Below the play-card animation, but above the hand.

        // Set initial animation state.
        tempCard.getContainer().setScale(0.2);
        tempCard.getContainer().setRotation(Phaser.Math.DegToRad(-45));

        // --- Animate existing cards to make space for the new one ---
        // We calculate positions for a hand size that is one larger than current.
        const finalCardCount = this.cardObjects.length + 1;
        this.cardObjects.forEach((cardObj, index) => {
            const newProps = this.calculateCardTransform(index, finalCardCount);
            this.scene.tweens.add({ targets: cardObj.getContainer(), x: newProps.x, y: newProps.y, rotation: newProps.rotation, duration: 250, ease: 'Cubic.easeOut' });
        });

        // --- Calculate the final destination for the new card ---
        const finalProps = this.calculateCardTransform(this.cardObjects.length, finalCardCount);

        // --- Animate the new card flying into place ---
        this.scene.tweens.add({
            targets: tempCard.getContainer(),
            x: finalProps.x,
            y: finalProps.y,
            rotation: finalProps.rotation,
            scale: 1,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Animation is done. Destroy the temporary card.
                tempCard.destroy();

                // Officially add the card data to the hand model with a unique instance ID
                const newCardData = {
                    instanceId: this.nextCardInstanceId++,
                    id: cardId,
                    isFlipped: false,
                    selected: false };
                this.drawnCards.push(newCardData);

                // Create the final, interactive card in the hand.
                const finalCard = new Card(this.scene, finalProps.x, finalProps.y, cardId, {
                    width: this.cardWidth,
                    height: this.cardHeight,
                    rotation: finalProps.rotation,
                    interactive: true,
                    hoverMoveDistance: 30,
                    hoverZoom: 1.1,
                    onClick: () => this.toggleSelected(this.drawnCards.length - 1)
                });

                // Add the final card to the hand's data structures.
                this.cardsContainer.add(finalCard.getContainer());
                this.cardObjects.push(finalCard);

                // The hand has changed, so we must update all onClick handlers
                // to use the correct new indices.
                this.cardObjects.forEach((cardObj, index) => {
                    cardObj.onClick = () => this.toggleSelected(index);
                });

                // We are no longer drawing, so we can process the next item in the queue.
                this.isDrawing = false;
                this.processDrawQueue();
            }
        });
    }

    /**
     * Calculates and animates all cards in the hand to their correct positions.
     * This is the core function for making the hand layout smooth.
     */
    reorganizeHand() {
        const cardCount = this.drawnCards.length;
        // If the hand is now empty, there's nothing to reorganize.
        // The PlayManager handles destroying the last card object.
        // Calling display() here would cause a race condition.
        if (cardCount === 0) {
            return;
        }

        const { width } = this.scene.game.config;

        // --- Animate each card to its new calculated position ---
        this.cardObjects.forEach((cardObj, index) => {
            const newProps = this.calculateCardTransform(index, cardCount);

            // Update the card's internal position and its onClick callback index
            cardObj.setPosition(newProps.x, newProps.y);
            cardObj.onClick = () => this.toggleSelected(index);

            this.scene.tweens.add({
                targets: cardObj.getContainer(),
                x: newProps.x,
                y: newProps.y,
                rotation: newProps.rotation,
                duration: 250,
                ease: 'Cubic.easeOut'
            });
        });
    }

    calculateCardTransform(index, cardCount) {
        const { width } = this.scene.game.config;
        const handY = this.scene.game.config.height - 50;
        let currentSpacing = this.spacing;

        if (cardCount >= 5) {
            const reductionFactor = 15;
            currentSpacing = this.spacing - (cardCount - 4) * reductionFactor;
            currentSpacing = Math.max(40, currentSpacing);
        }

        const totalWidth = (cardCount - 1) * currentSpacing;
        const startX = (width - totalWidth) / 2;

        const x = startX + index * currentSpacing;
        const distFromCenter = Math.abs(index - (cardCount - 1) / 2);
        const y = handY - Math.cos(distFromCenter * 0.5) * this.curveStrength;
        const normalizedIndex = index - (cardCount - 1) / 2;
        const rotation = (normalizedIndex / cardCount) * this.maxRotation;

        return { x, y, rotation };
    }

    /**
     * Get the container for adding to scene
     */
    getContainer() {
        return this.cardsContainer;
    }
}
