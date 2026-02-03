class Card {
    constructor(scene, x, y, cardId, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.cardId = cardId;
        this.cardInfo = getCardInfo(cardId);
        
        // Options
        this.width = options.width || 120;
        this.height = options.height || 180;
        this.fontSize = options.fontSize || 28;
        this.rotation = options.rotation || 0;
        this.interactive = options.interactive !== false;
        this.onHover = options.onHover;
        this.onUnhover = options.onUnhover;
        this.onFlip = options.onFlip;
        this.isFlipped = options.isFlipped || false;
        
        // Hover effect parameters
        this.hoverMoveDistance = options.hoverMoveDistance || 0; // How much to move on hover (0 = no move)
        this.hoverZoom = options.hoverZoom || 1; // Scale factor on hover (1 = no zoom)
        this.hoverGlow = options.hoverGlow; // Add glow effect on hover
        this.hoverInDuration = options.hoverInDuration || 40; // Duration for hover-in tween
        this.hoverOutDuration = options.hoverOutDuration || 300; // Duration for hover-out tween
        
        // Create container for card + text
        this.container = this.scene.add.container(x, y);
        
        // Card background
        this.cardRect = this.scene.add.rectangle(
            0, 0, 
            this.width, this.height, 
            0xffffff
        );
        this.cardRect.setStrokeStyle(2, 0x000000);
        
        // Card value text (top left)
        this.valueText = this.scene.add.text(
            -this.width / 2 + 10, 
            -this.height / 2 + 10,
            this.cardInfo.value.toString(),
            {
                font: `bold ${this.fontSize}px Arial`,
                fill: '#000000'
            }
        ).setOrigin(0, 0);
        
        // Add elements to container
        this.container.add([this.cardRect, this.valueText]);

        if (this.isFlipped) {
            this.valueText.setVisible(false); // Hide the original value

            const flippedText = this.scene.add.text(
                0, 0, 'XX', {
                    font: `bold ${this.height * 0.6}px Arial`, // Make it big
                    fill: '#ff0000',
                    align: 'center'
                }
            ).setOrigin(0.5);

            this.container.add(flippedText);
        }
        this.container.setRotation(this.rotation);
        
        // Setup interactivity
        if (this.interactive) {
            this.setupInteractivity();
        }
    }
    
    setupInteractivity() {
        this.container.setInteractive(
            new Phaser.Geom.Rectangle(
                -this.width / 2, 
                -this.height / 2, 
                this.width, 
                this.height
            ),
            Phaser.Geom.Rectangle.Contains
        );
        
        this.container.on('pointerover', () => {
            this.onHoverStart();
        });
        
        this.container.on('pointerout', () => {
            this.onHoverEnd();
        });
        
        this.container.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.showViewscreen();
            } else if (this.onFlip) {
                this.onFlip();
            }
        });
    }
    
    onHoverStart() {
        const tweenConfig = {
            targets: [this.container],
            duration: this.hoverInDuration,
            ease: 'Power2.easeOut'
        };
        
        // Add scale if zoom is specified
        if (this.hoverZoom !== 1) {
            tweenConfig.scale = this.hoverZoom;
        }
        
        // Add y movement if move distance is specified
        if (this.hoverMoveDistance !== 0) {
            tweenConfig.y = this.y - this.hoverMoveDistance;
        }
        
        this.scene.tweens.add(tweenConfig);
        
        // Add glow effect if enabled
        if (this.hoverGlow) {
            this.cardRect.setStrokeStyle(3, 0xffff00);
        }
        
        if (this.onHover) {
            this.onHover();
        }
    }
    
    onHoverEnd() {
        const tweenConfig = {
            targets: [this.container],
            duration: this.hoverOutDuration,
            ease: 'Sine.easeOut',
            scale: 1
        };
        
        // Only tween the y position back if it was moved in the first place
        if (this.hoverMoveDistance !== 0) {
            tweenConfig.y = this.y;
        }

        this.scene.tweens.add(tweenConfig);
        
        // Remove glow effect
        this.cardRect.setStrokeStyle(2, 0x000000);
        
        if (this.onUnhover) {
            this.onUnhover();
        }
    }
    
    
    /**
     * Show the card in a full-screen view
     */
    showViewscreen() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Use a container to hold all viewscreen elements
        const viewscreenContainer = this.scene.add.container(0, 0);
        viewscreenContainer.setDepth(100); // Ensure it's on top
        viewscreenContainer.setScrollFactor(0); // Make the entire modal immune to camera scrolling
        
        // --- Function to draw/redraw the modal contents ---
        const drawModalContents = () => {
            viewscreenContainer.removeAll(true); // Clear previous contents
            
            const currentWidth = this.scene.cameras.main.width;
            const currentHeight = this.scene.cameras.main.height;
            
            // Re-create overlay
            viewscreenContainer.add(createOverlay(currentWidth, currentHeight));

            // Create a container for the scaled content
            const contentContainer = this.scene.add.container(0, 0);
            viewscreenContainer.add(contentContainer);
            
            // Create the large card and add it to the content container
            contentContainer.add(createLargeCard().getContainer());
            
            // Center the content container
            contentContainer.setPosition(currentWidth / 2, currentHeight / 2);
        };
        
        // --- Helper functions to create modal elements ---
        const createOverlay = (w, h) => {
            return this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
                .setInteractive()
                .on('pointerdown', () => closeModal());
        };
        
        const createLargeCard = () => {
            // Size the card relative to the base resolution, not the window size
            const largeCardHeight = this.scene.cameras.main.height * 0.8;
            const largeCardWidth = largeCardHeight * (this.width / this.height);
            
            // Position it in the center of the base resolution
            const card = new Card(this.scene, 0, 0, this.cardId, {
                width: largeCardWidth,
                height: largeCardHeight,
                fontSize: 64,
                interactive: true
            });
            // Prevent card from closing modal on pointer down
            card.getContainer().on('pointerdown', (pointer) => {
                pointer.stopPropagation();
            });
            return card;
        };
        
        // Initial draw
        drawModalContents();
        
        // Listen for resize events while the modal is open
        this.scene.scale.on('resize', drawModalContents, this);
        
        // Function to clean up and close the viewscreen
        const closeModal = () => {
            // A small fade out for a smoother exit
            this.scene.tweens.add({
                targets: viewscreenContainer,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    viewscreenContainer.destroy();
                    this.scene.scale.off('resize', drawModalContents, this); // Stop listening for resize
                    this.scene.input.keyboard.off('keydown-ESC', onEsc);
                }
            });
        };
        
        const onEsc = () => closeModal();
        // Use 'once' to avoid stacking listeners if modal is opened multiple times
        this.scene.input.keyboard.on('keydown-ESC', onEsc);
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
    }
    
    getContainer() {
        return this.container;
    }
    
    destroy() {
        this.container.destroy();
    }
}
