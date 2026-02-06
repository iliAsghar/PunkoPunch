/**
 * PileManager - Manages deck and discard piles
 * Handles pile display, interactions, and modals
 */
class PileManager {
    constructor(scene, parentContainer) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.deck = [];
        this.discardPile = [];
        
        // Pile UI constants
        this.padding = 30;
        this.pileWidth = 80;
        this.pileHeight = 120;
        
        this.uiContainer = this.scene.add.container(0, 0);
        this.parentContainer.add(this.uiContainer);
        this.deckPileContainer = null;
        this.deckCountText = null;
        this.discardPileContainer = null;
        this.discardCountText = null;
    }
    
    /**
     * Initialize the piles with cards
     */
    initialize(deckCards) {
        this.deck = [...deckCards];
        this.discardPile = [];
    }
    
    /**
     * Draw a card from the deck
     */
    drawCard() {
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            this.updateDeckDisplay();
            return card;
        }
        return null;
    }
    
    /**
     * Transfer all cards from discard pile back to deck
     */
    transferDiscardToDeck() {
        const cardsToTransferCount = this.discardPile.length;
        if (cardsToTransferCount === 0) return;

        // The data model is updated instantly, but the UI will be animated.
        this.deck = [...this.discardPile].reverse();
        this.discardPile = [];

        // Create a temporary object to tween its value.
        let counter = { value: cardsToTransferCount };

        // Create a tween to animate the count from discard to deck.
        this.scene.tweens.add({
            targets: counter,
            value: 0,
            duration: 1000, // A fast "whoosh" effect
            ease: 'Power1',
            onUpdate: () => {
                // On each frame of the tween, update the text displays.
                const currentDiscardCount = Math.floor(counter.value);
                const currentDeckCount = this.deck.length - currentDiscardCount;

                if (this.discardCountText) {
                    this.discardCountText.setText(currentDiscardCount);
                }
                if (this.deckCountText) {
                    this.deckCountText.setText(currentDeckCount);
                }
            },
            onComplete: () => {
                // After the animation, ensure the final counts are perfectly accurate.
                this.updateDeckDisplay();
                this.updateDiscardDisplay();
            }
        });
    }
    
    /**
     * Discard a card
     */
    discardCard(card) {
        this.discardPile.push(card);
        this.updateDiscardDisplay();
    }
    
    /**
     * Get deck cards
     */
    getDeck() {
        return this.deck;
    }
    
    /**
     * Get discard pile cards
     */
    getDiscardPile() {
        return this.discardPile;
    }
    
    /**
     * Create UI elements for the piles
     */
    createUI() {
        // Destroy old UI elements before creating new ones
        this.uiContainer.each((child) => {
            child.destroy();
        });
        this.uiContainer.removeAll(true);
        
        const width = this.scene.game.config.width; // Use base width
        const height = this.scene.game.config.height; // Use base height
        
        // ===== DECK PILE (Left) =====
        const deckPileX = this.padding + this.pileWidth / 2;
        const deckPileY = height - this.padding - this.pileHeight / 2;
        
        this.deckPileContainer = this.scene.add.container(deckPileX, deckPileY);
        
        const deckRect = this.scene.add.rectangle(
            0, 0,
            this.pileWidth, this.pileHeight, 
            0xcccccc
        )
            .setStrokeStyle(2, 0x000000)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) return;
                this.showDeckModal();
            })
            .on('pointerover', () => {
                this.scene.tweens.add({ targets: this.deckPileContainer, scale: 1.1, duration: 100, ease: 'Power2' });
            })
            .on('pointerout', () => {
                this.scene.tweens.add({ targets: this.deckPileContainer, scale: 1, duration: 100, ease: 'Power2' });
            });
        
        this.deckCountText = this.scene.add.text(
            0, 0, 
            this.deck.length.toString(),
            { font: 'bold 30px Arial', fill: '#000000' }
        ).setOrigin(0.5);

        this.deckPileContainer.add([deckRect, this.deckCountText]);
        this.uiContainer.add(this.deckPileContainer);

        // Draw button above deck
        const drawBtnX = deckPileX;
        const drawBtnY = deckPileY - this.pileHeight / 2 - 40;
        const drawBtn = this.scene.add.rectangle(drawBtnX, drawBtnY, 80, 35, 0x000000)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) return;
                this.scene.gameManager?.drawCard(1);
            })
            .on('pointerover', function() { this.setFillStyle(0x333333); })
            .on('pointerout', function() { this.setFillStyle(0x000000); });
        
        const drawBtnText = this.scene.add.text(drawBtnX, drawBtnY, 'Draw', {
            font: 'bold 12px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Draw 5 button above the single draw button
        const draw5BtnX = drawBtnX;
        const draw5BtnY = drawBtnY - 45; // Position it 45px above the other button
        const draw5Btn = this.scene.add.rectangle(draw5BtnX, draw5BtnY, 80, 35, 0x007bff) // A nice blue color
            .setInteractive()
            .on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) return;
                this.scene.gameManager?.drawCard(5);
            })
            .on('pointerover', function() { this.setFillStyle(0x0056b3); })
            .on('pointerout', function() { this.setFillStyle(0x007bff); });

        const draw5BtnText = this.scene.add.text(draw5BtnX, draw5BtnY, 'Draw 5', {
            font: 'bold 12px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // ===== DISCARD PILE (Right) =====
        const discardPileX = width - this.padding - this.pileWidth / 2;
        const discardPileY = height - this.padding - this.pileHeight / 2;
        
        this.discardPileContainer = this.scene.add.container(discardPileX, discardPileY);
        
        const discardRect = this.scene.add.rectangle(
            0, 0,
            this.pileWidth, this.pileHeight, 
            0xcccccc
        )
            .setStrokeStyle(2, 0x000000)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) return;
                this.showDiscardModal();
            })
            .on('pointerover', () => {
                this.scene.tweens.add({ targets: this.discardPileContainer, scale: 1.1, duration: 100, ease: 'Power2' });
            })
            .on('pointerout', () => {
                this.scene.tweens.add({ targets: this.discardPileContainer, scale: 1, duration: 100, ease: 'Power2' });
            });
        
        this.discardCountText = this.scene.add.text(
            0, 0, 
            this.discardPile.length.toString(),
            { font: 'bold 30px Arial', fill: '#000000' }
        ).setOrigin(0.5);

        this.discardPileContainer.add([discardRect, this.discardCountText]);
        this.uiContainer.add(this.discardPileContainer);

        // Add all UI elements to the container
        this.uiContainer.add([
            draw5Btn,
            draw5BtnText,
            drawBtn,
            drawBtnText,
        ]);
    }
    
    /**
     * Update deck count display
     */
    updateDeckDisplay() {
        if (this.deckCountText) {
            this.deckCountText.setText(this.deck.length.toString());
        }
    }
    
    /**
     * Update discard pile count display
     */
    updateDiscardDisplay() {
        if (this.discardCountText) {
            this.discardCountText.setText(this.discardPile.length.toString());
        }
    }
    
    /**
     * Show deck modal with grid of cards
     */
    showDeckModal() {
        this.showPileModal(this.deck, 'Draw Pile');
    }
    
    /**
     * Show discard pile modal with grid of cards
     */
    showDiscardModal() {
        this.showPileModal(this.discardPile, 'Discard Pile');
    }
    
    /**
     * Generic modal display for viewing pile contents
     */
    showPileModal(pile, title) {
        // --- Main container for the modal ---
        const modalContainer = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        let wheelListener = null;

        // --- Helper to close the modal ---
        const closeModal = () => {
            this.scene.tweens.add({
                targets: modalContainer,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    modalContainer.destroy();
                    this.scene.scale.off('resize', drawModalContents, this);
                    this.scene.input.keyboard.off('keydown-ESC', onEsc);
                    if (wheelListener) {
                        this.scene.input.off('wheel', wheelListener);
                    }
                }
            });
        };

        const onEsc = () => closeModal();
        this.scene.input.keyboard.on('keydown-ESC', onEsc);

        // --- Function to draw/redraw the modal contents ---
        const drawModalContents = () => {
            modalContainer.removeAll(true); // Clear previous contents
            if (wheelListener) {
                this.scene.input.off('wheel', wheelListener); // Remove old listener
                wheelListener = null;
            }

            const { width, height } = this.scene.cameras.main;

            // 1. Overlay
            const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setInteractive()
                .on('pointerdown', closeModal);
            modalContainer.add(overlay);

            // 2. Content Box
            const boxWidth = width * 0.85;
            const boxHeight = height * 0.85;
            const boxX = width / 2;
            const boxY = height / 2;

            const box = this.scene.add.graphics();
            box.fillStyle(0xfdfdfd, 1);
            box.fillRect(boxX - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight);
            box.lineStyle(4, 0x000000, 1);
            box.strokeRect(boxX - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight);
            modalContainer.add(box);

            // Stop clicks on the box from closing the modal
            const boxZone = this.scene.add.zone(boxX, boxY, boxWidth, boxHeight).setInteractive();
            boxZone.on('pointerdown', (pointer) => pointer.stopPropagation());
            modalContainer.add(boxZone);

            // 3. Title
            const titleText = this.scene.add.text(boxX, boxY - boxHeight / 2 + 40, title, {
                font: 'bold 32px Arial',
                fill: '#000000',
                align: 'center'
            }).setOrigin(0.5);
            modalContainer.add(titleText);

            // 4. Card Grid Area
            const gridPadding = 10; // Increased padding for more breathing room
            const gridpaddinghorizontal = 20; // Increased horizontal padding
            const topOffset = 90; // Increased top offset for title and padding
            const gridWidth = boxWidth - (gridPadding * 2 + gridpaddinghorizontal * 2);
            const gridHeight = boxHeight - topOffset - gridPadding;
            const gridX = boxX - boxWidth / 2 + gridPadding + gridpaddinghorizontal;
            const gridY = boxY - boxHeight / 2 + topOffset;

            const cardsContainer = this.scene.add.container(gridX, gridY);
            modalContainer.add(cardsContainer);

            // Grid layout
            const cardPreviewWidth = 100;
            const cardPreviewHeight = 150;
            const cardSpacingX = 20;
            const cardSpacingY = 20;

            const cols = Math.floor((gridWidth + cardSpacingX) / (cardPreviewWidth + cardSpacingX));
            
            // Calculate the actual width the grid content will occupy to center it.
            const actualContentWidth = (cols * cardPreviewWidth) + Math.max(0, cols - 1) * cardSpacingX;
            const startXOffset = (gridWidth - actualContentWidth) / 2;

            let currentX = startXOffset;
            let currentY = 10;

            pile.forEach((cardData, index) => {
                // Create card at (0,0) and add it to the container first.
                // Then, set its position relative to the container.
                // This avoids confusion with world vs. local coordinates.
                const card = new HandCard(this.scene, 0, 0, cardData.id, {
                    width: cardPreviewWidth, height: cardPreviewHeight, fontSize: 20,
                    hoverZoom: 1.05,
                    hoverMoveDistance: 0
                });
                cardsContainer.add(card.getContainer());

                // The Card component's position is its center. We calculate the center of the grid slot.
                const cardCenterX = currentX + cardPreviewWidth / 2;
                const cardCenterY = currentY + cardPreviewHeight / 2;
                card.getContainer().setPosition(cardCenterX, cardCenterY);

                // Move to the next grid slot
                currentX += cardPreviewWidth + cardSpacingX;
                if ((index + 1) % cols === 0 && index < pile.length - 1) {
                    currentX = startXOffset;
                    currentY += cardPreviewHeight + cardSpacingY;
                }
            });
            
            // Add padding to the bottom of the content to ensure the last row
            // doesn't get clipped on hover/scale.
            const contentHeight = currentY + cardPreviewHeight + gridPadding;

            // 5. Scrolling & Masking
            if (contentHeight > gridHeight) {
                const maskShape = this.scene.make.graphics();
                maskShape.fillStyle(0xffffff);
                maskShape.fillRect(gridX, gridY, gridWidth, gridHeight);
                const mask = maskShape.createGeometryMask();
                cardsContainer.setMask(mask);

                let scrollY = 0;
                const maxScroll = contentHeight - gridHeight;

                wheelListener = (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
                    if (boxZone.getBounds().contains(pointer.x, pointer.y)) {
                        // Directly manipulate the container's position for a "default" scroll feel
                        scrollY -= deltaY * 0.5; // Adjust this multiplier for scroll speed
                        
                        // Clamp the scroll value to prevent scrolling past the content
                        scrollY = Phaser.Math.Clamp(scrollY, -maxScroll, 0);
                        cardsContainer.y = gridY + scrollY;
                    }
                };
                this.scene.input.on('wheel', wheelListener);
            }
        };

        // --- Initial Draw & Resize Listener ---
        drawModalContents();
        this.scene.scale.on('resize', drawModalContents, this);
    }

    /**
     * Gets the world coordinates of the deck pile container.
     * @returns {{x: number, y: number}}
     */
    getDeckPosition() {
        if (!this.deckPileContainer) return { x: 0, y: 0 };
        return { x: this.deckPileContainer.x, y: this.deckPileContainer.y };
    }

    /**
     * Gets the world coordinates of the discard pile container.
     * @returns {{x: number, y: number}}
     */
    getDiscardPilePosition() {
        if (!this.discardPileContainer) return { x: 0, y: 0 };
        return { x: this.discardPileContainer.x, y: this.discardPileContainer.y };
    }
}
