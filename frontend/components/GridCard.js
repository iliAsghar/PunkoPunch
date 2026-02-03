/**
 * Card - A reusable card component for the game.
 * Handles its own appearance, state (flipped/not flipped), and interactions.
 */
class GridCard {
    constructor(scene, x, y, cardId, options = {}) {
        this.scene = scene;
        this.cardId = cardId;
        this.options = {
            width: 120,
            height: 180,
            fontSize: 48,
            rotation: 0,
            interactive: false,
            hoverMoveDistance: 0,
            hoverZoom: 1,
            isFlipped: false,
            onFlip: () => {},
            ...options,
        };

        // The main container for the card
        this.container = this.scene.add.container(x, y);
        this.container.setSize(this.options.width, this.options.height);
        this.container.setRotation(this.options.rotation);

        // Card back (visible when not flipped)
        this.cardBack = this.scene.add.graphics();
        this.cardBack.fillStyle(0x333333); // Dark grey
        this.cardBack.fillRoundedRect(-this.options.width / 2, -this.options.height / 2, this.options.width, this.options.height, 10);
        this.cardBack.lineStyle(4, 0xffffff); // White border
        this.cardBack.strokeRoundedRect(-this.options.width / 2, -this.options.height / 2, this.options.width, this.options.height, 10);
        this.container.add(this.cardBack);

        // Card front (visible when flipped)
        this.cardFront = this.scene.add.graphics();
        this.cardFront.fillStyle(0xffffff); // White
        this.cardFront.fillRoundedRect(-this.options.width / 2, -this.options.height / 2, this.options.width, this.options.height, 10);
        this.cardFront.lineStyle(4, 0x333333); // Dark border
        this.cardFront.strokeRoundedRect(-this.options.width / 2, -this.options.height / 2, this.options.width, this.options.height, 10);
        
        this.cardText = this.scene.add.text(0, 0, this.cardId, {
            fontSize: `${this.options.fontSize}px`,
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.frontContainer = this.scene.add.container(0, 0, [this.cardFront, this.cardText]);
        this.container.add(this.frontContainer);

        // Set initial flipped state
        this.isFlipped = this.options.isFlipped;
        this.updateVisibility();

        if (this.options.interactive) {
            this.container.setInteractive();
            this.setupInteractions();
        }
    }

    updateVisibility() {
        this.cardBack.setVisible(!this.isFlipped);
        this.frontContainer.setVisible(this.isFlipped);
    }

    flip() {
        // Simple instant flip for now. Can be replaced with an animation.
        this.isFlipped = !this.isFlipped;
        this.updateVisibility();
        this.options.onFlip(this); // Call the callback
    }

    setupInteractions() {
        const initialY = this.container.y;
        const initialScale = this.container.scale;

        this.container.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.flip();
            } else if (pointer.rightButtonDown()) {
                // "Peek" at the back of a flipped card
                if (this.isFlipped) {
                    this.flip();
                }
            }
        });

        this.container.on('pointerup', (pointer) => {
            // If the right button was just released, flip the card back
            if (pointer.rightButtonReleased() && !this.isFlipped) {
                this.flip();
            }
        });

        this.container.on('pointerover', () => {
            // You can add hover effects here if desired for the grid cards
        });

        this.container.on('pointerout', () => {
            // You can add hover effects here if desired for the grid cards
        });
    }

    getContainer() {
        return this.container;
    }
}