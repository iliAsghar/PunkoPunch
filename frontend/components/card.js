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
        
        // Hover effect parameters
        this.hoverMoveDistance = options.hoverMoveDistance; // How much to move on hover (0 = no move)
        this.hoverZoom = options.hoverZoom; // Scale factor on hover (1 = no zoom)
        this.hoverGlow = options.hoverGlow; // Add glow effect on hover
        
        // 3D parallax effect parameters
        this.tiltEffect = options.tiltEffect !== false;
        this.tiltAmount = options.tiltAmount || 0.2; // Radians for tilt
        
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
            }
        });
        
        this.container.on('pointermove', (pointer) => {
            if (this.tiltEffect) {
                this.handle3DTilt(pointer);
            }
        });
    }
    
    onHoverStart() {
        const tweenConfig = {
            targets: [this.container],
            duration: 40,
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
            duration: 150,
            ease: 'Sine.easeOut',
            y: this.y,
            scale: 1,
            rotationX: 0, // Reset tilt
            rotationY: 0  // Reset tilt
        };
        
        this.scene.tweens.add(tweenConfig);
        
        // Remove glow effect
        this.cardRect.setStrokeStyle(2, 0x000000);
        
        if (this.onUnhover) {
            this.onUnhover();
        }
    }
    
    /**
     * Handles the 3D perspective tilt effect on mouse move
     */
    handle3DTilt(pointer) {
        // Get pointer position relative to the card's container center
        const { width, height, x, y } = this.container;
        const localX = pointer.x - x;
        const localY = pointer.y - y;
        
        // Normalize the position from -1 to 1
        const normalizedX = Phaser.Math.Clamp(localX / (width / 2), -1, 1);
        const normalizedY = Phaser.Math.Clamp(localY / (height / 2), -1, 1);
        
        // Apply tilt. The rotation is inverted for a natural feel.
        // Moving mouse to the right (positive X) should lift the left edge (positive Y rotation).
        // Moving mouse to the bottom (positive Y) should lift the top edge (negative X rotation).
        this.container.rotationY = normalizedX * this.tiltAmount;
        this.container.rotationX = -normalizedY * this.tiltAmount;
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
            
            this.scene.onResize({ width: currentWidth, height: currentHeight }, contentContainer);
        };
        
        // --- Helper functions to create modal elements ---
        const createOverlay = (w, h) => {
            return this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
                .setInteractive()
                .on('pointerdown', () => closeModal());
        };
        
        const createLargeCard = () => {
            // Size the card relative to the base resolution, not the window size
            const largeCardHeight = this.scene.baseHeight * 0.8;
            const largeCardWidth = largeCardHeight * (this.width / this.height);
            
            // Position it in the center of the base resolution
            const card = new Card(this.scene, this.scene.baseWidth / 2, this.scene.baseHeight / 2, this.cardId, {
                width: largeCardWidth,
                height: largeCardHeight,
                fontSize: 64,
                interactive: false
            });
            // The parent container will be immune to scroll, so the card doesn't need to be.
            // card.getContainer().setScrollFactor(0);
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
