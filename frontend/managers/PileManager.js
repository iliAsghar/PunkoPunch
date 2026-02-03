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
        this.deckRect = null;
        this.deckCountText = null;
        this.discardRect = null;
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
            
            // If deck is now empty, transfer discard pile back to deck immediately
            if (this.deck.length === 0 && this.discardPile.length > 0) {
                this.transferDiscardToDeck();
            }
            
            return card;
        }
        return null;
    }
    
    /**
     * Transfer all cards from discard pile back to deck
     */
    transferDiscardToDeck() {
        this.deck = [...this.discardPile].reverse(); // Reverse to maintain order
        this.discardPile = [];
        this.updateDeckDisplay();
        this.updateDiscardDisplay();
    }
    
    /**
     * Discard a card
     */
    discardCard(card) {
        this.discardPile.push(card);
        this.updateDiscardDisplay();
        
        // If deck is now empty, transfer discard pile back to deck immediately
        if (this.deck.length === 0 && this.discardPile.length > 0) {
            this.transferDiscardToDeck();
        }
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
        
        this.deckRect = this.scene.add.rectangle(
            deckPileX, deckPileY, 
            this.pileWidth, this.pileHeight, 
            0xcccccc
        )
            .setStrokeStyle(2, 0x000000)
            .setInteractive()
            .on('pointerdown', () => this.showDeckModal())
            .on('pointerover', function() {
                this.setStrokeStyle(3, 0xffff00);
            })
            .on('pointerout', function() {
                this.setStrokeStyle(2, 0x000000);
            });
        
        this.deckCountText = this.scene.add.text(
            deckPileX, deckPileY, 
            this.deck.length.toString(),
            { font: 'bold 24px Arial', fill: '#000000' }
        ).setOrigin(0.5);

        // Draw button above deck
        const drawBtnX = deckPileX;
        const drawBtnY = deckPileY - this.pileHeight / 2 - 40;
        const drawBtn = this.scene.add.rectangle(drawBtnX, drawBtnY, 80, 35, 0x000000)
            .setInteractive()
            .on('pointerover', function() { this.setFillStyle(0x333333); })
            .on('pointerout', function() { this.setFillStyle(0x000000); })
            .on('pointerdown', () => this.scene.gameManager?.drawCard());
        
        const drawBtnText = this.scene.add.text(drawBtnX, drawBtnY, 'Draw', {
            font: 'bold 12px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // ===== DISCARD PILE (Right) =====
        const discardPileX = width - this.padding - this.pileWidth / 2;
        const discardPileY = height - this.padding - this.pileHeight / 2;
        
        this.discardRect = this.scene.add.rectangle(
            discardPileX, discardPileY, 
            this.pileWidth, this.pileHeight, 
            0xcccccc
        )
            .setStrokeStyle(2, 0x000000)
            .setInteractive()
            .on('pointerdown', () => this.showDiscardModal())
            .on('pointerover', function() {
                this.setStrokeStyle(3, 0xffff00);
            })
            .on('pointerout', function() {
                this.setStrokeStyle(2, 0x000000);
            });
        
        this.discardCountText = this.scene.add.text(
            discardPileX, discardPileY, 
            this.discardPile.length.toString(),
            { font: 'bold 24px Arial', fill: '#000000' }
        ).setOrigin(0.5);

        // Discard button above discard pile
        const discardBtnX = discardPileX;
        const discardBtnY = discardPileY - this.pileHeight / 2 - 40;
        const discardBtn = this.scene.add.rectangle(discardBtnX, discardBtnY, 80, 35, 0x000000)
            .setInteractive()
            .on('pointerover', function() { this.setFillStyle(0x333333); })
            .on('pointerout', function() { this.setFillStyle(0x000000); })
            .on('pointerdown', () => this.scene.gameManager?.discardCard());
        
        const discardBtnText = this.scene.add.text(discardBtnX, discardBtnY, 'Discard', {
            font: 'bold 12px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add all UI elements to the container
        this.uiContainer.add([
            this.deckRect,
            this.deckCountText,
            drawBtn,
            drawBtnText,
            this.discardRect,
            this.discardCountText,
            discardBtn,
            discardBtnText
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
        this.showPileModal(this.deck, 'Deck');
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
        const modalContainer = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

        const drawModalContents = () => {
            modalContainer.removeAll(true);

            const currentWidth = this.scene.cameras.main.width;
            const currentHeight = this.scene.cameras.main.height;

            // Full-screen dark overlay
            const overlay = this.scene.add.rectangle(currentWidth / 2, currentHeight / 2, currentWidth, currentHeight, 0x000000, 0.5)
                .setInteractive()
                .on('pointerdown', () => closeModal());
            modalContainer.add(overlay);

            // Container for the scaled content
            const contentContainer = this.scene.add.container(0, 0);
            modalContainer.add(contentContainer);

            // Title
            const titleText = this.scene.add.text(this.scene.baseWidth / 2, 50, title, {
                font: 'bold 48px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            contentContainer.add(titleText);

            // Grid parameters
            const margin = 40;
            const cardWidth = 100;
            const cardHeight = 150;
            const gap = 20;
            const colsPerRow = Math.floor((this.scene.baseWidth - margin * 2) / (cardWidth + gap));
            const gridStartX = margin;
            const gridStartY = 120;

            // Create cards grid
            pile.forEach((card, index) => {
                const col = index % colsPerRow;
                const row = Math.floor(index / colsPerRow);
                const x = gridStartX + col * (cardWidth + gap) + cardWidth / 2;
                const y = gridStartY + row * (cardHeight + gap) + cardHeight / 2;

                const cardObj = new Card(this.scene, x, y, card.id, {
                    width: cardWidth,
                    height: cardHeight,
                    fontSize: 16,
                    interactive: true,
                    hoverMoveDistance: 0,
                    hoverZoom: 1.05,
                    hoverGlow: false
                });
                contentContainer.add(cardObj.getContainer());
            });

            // Empty state
            if (pile.length === 0) {
                const emptyText = this.scene.add.text(this.scene.baseWidth / 2, this.scene.baseHeight / 2, 'Empty', {
                    font: 'bold 36px Arial',
                    fill: '#999999'
                }).setOrigin(0.5);
                contentContainer.add(emptyText);
            }

            // Scale the content container
            this.scene.onResize({ width: currentWidth, height: currentHeight }, contentContainer);
        };

        const closeModal = () => {
            modalContainer.destroy();
            this.scene.scale.off('resize', drawModalContents, this);
            this.scene.input.keyboard.off('keydown-ESC', onEsc);
            this.scene.input.off('wheel');
        };

        const onEsc = () => closeModal();
        this.scene.input.keyboard.on('keydown-ESC', onEsc);
        
        drawModalContents();
        this.scene.scale.on('resize', drawModalContents, this);

        // Mouse wheel scroll
        this.scene.input.on('wheel', (pointer, over, deltaX, deltaY) => {
            // Scroll the inner content, not the scaled container
            const contentContainer = modalContainer.getAt(1); // The content container is the second element
            if (contentContainer) {
                contentContainer.y -= deltaY * 0.5;
            }
        });
    }
}
