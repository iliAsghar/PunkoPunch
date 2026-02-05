class Card {
    /**
     * Handles the "push down" effect when the mouse is pressed on the card.
     */
    onPointerDown() {
        if (this.isFlipping) return;

        this.scene.tweens.killTweensOf(this.container);

        const pressDownScale = this.hoverZoom * 0.95; // Slightly smaller than hover zoom

        this.scene.tweens.add({
            targets: this.container,
            scaleX: pressDownScale,
            scaleY: pressDownScale,
            duration: 50,
            ease: 'Power1'
        });
    }

    /**
     * Handles releasing the "push down" effect when the mouse is released.
     */
    onPointerUp() {
        if (this.isFlipping) return;

        // When the pointer is released, we want to return to the hover state,
        // as the cursor will still be over the card.
        // The onHoverStart method handles this perfectly.
        if (this.isHovered) {
            this.onHoverStart();
        } else {
            // If for some reason the pointer was released when not hovered
            // (e.g., dragged off and then back on very quickly),
            // just go back to the default state.
            this.onHoverEnd();
        }
    }

    /**
     * Toggles the visual state of the card between face-up and face-down with an animation.
     */
    flip() {
        // Prevent starting a new flip animation if one is already running
        if (this.isFlipping) {
            return;
        }
        this.isFlipping = true;
        this.container.disableInteractive(); // Prevent clicks during animation

        // First, stop any hover-related tweens to avoid conflicts
        this.scene.tweens.killTweensOf(this.container);

        // First half of the flip: scale X down to 0
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0,
            duration: 150,
            ease: 'Power2.easeIn',
            onComplete: () => {
                // At the halfway point, update the card's state and visuals
                this.isFlipped = !this.isFlipped;
                this.valueText.setVisible(!this.isFlipped);
                this.flippedText.setVisible(this.isFlipped);

                // Determine the final scale *after* the first half of the animation.
                // This ensures we respect any hover state changes that happened during the animation.
                const finalScale = this.isHovered ? this.hoverZoom : 1;

                const finalTweenConfig = {
                    targets: this.container,
                    scaleX: finalScale,
                    scaleY: finalScale,
                    duration: 150,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        this.isFlipping = false; // Allow flipping again
                        this.container.setInteractive(); // Re-enable clicks
                    }
                };

                // Only animate the Y position if the card is supposed to move on hover.
                // We check for the internal offset container, which is the new way of handling hover movement.
                if (this.offsetContainer) {
                    // If hovered, the card's visual elements should be in their "up" state.
                    const targetY = this.isHovered ? -this.hoverMoveDistance : 0;
                    finalTweenConfig.y = targetY; // This targets the offsetContainer's y position
                } else if (this.hoverMoveDistance !== 0) { // Legacy check for non-offset cards
                    finalTweenConfig.y = this.isHovered ? this.y - this.hoverMoveDistance : this.y;
                }

                this.scene.tweens.add(finalTweenConfig);
            }
        });
    }

    constructor(scene, x, y, cardId, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.cardId = cardId;

        // Allow specifying which dictionary to use for card info
        const cardInfoSource = options.cardInfoSource || 'player'; // 'player' or 'grid'
        if (cardInfoSource === 'grid') {
            this.cardInfo = getGridCardInfo(cardId);
        } else {
            this.cardInfo = getCardInfo(cardId);
        }
        
        // Options
        this.width = options.width || 120;
        this.height = options.height || 180;
        this.fontSize = options.fontSize || 28;
        this.rotation = options.rotation || 0;
        this.interactive = options.interactive !== false;
        this.onHover = options.onHover;
        this.onUnhover = options.onUnhover;
        this.onFlip = options.onFlip;
        this.onClick = options.onClick; // New callback for general clicks
        this.centerText = options.centerText || false; // New option to center the text
        this.allowViewscreen = options.allowViewscreen !== false; // Default to true
        this.isFlipping = false; // To prevent animation conflicts
        this.isFlipped = options.isFlipped || false;
        this.isHovered = false; // Track hover state
        this.isSelected = options.isSelected || false; // New property for selection state

        // Hover effect parameters
        this.hoverMoveDistance = options.hoverMoveDistance || 0; // How much to move on hover (0 = no move)
        this.hoverZoom = options.hoverZoom || 1; // Scale factor on hover (1 = no zoom)
        this.hoverGlow = options.hoverGlow; // Add glow effect on hover
        this.hoverInDuration = options.hoverInDuration || 40; // Duration for hover-in tween
        this.hoverOutDuration = options.hoverOutDuration || 300; // Duration for hover-out tween
        
        // The main container holds everything and is used for positioning and interactivity.
        this.container = this.scene.add.container(x, y);

        // The offset container holds the visual elements. It will be moved up/down on hover.
        // We only create it if a hover move distance is specified.
        this.offsetContainer = this.hoverMoveDistance !== 0 ? this.scene.add.container(0, 0) : null;
        if (this.offsetContainer) this.container.add(this.offsetContainer);
        
        // Card background
        this.cardRect = this.scene.add.rectangle(
            0, 0, 
            this.width, this.height,
            0xffffff
        );
        if (this.isSelected) {
            this.cardRect.setStrokeStyle(4, 0xffa500, 1); // Orange glow for selected
        } else {
            this.cardRect.setStrokeStyle(2, 0x000000); // Default black border
        }
        
        // Card value text
        this.valueText = this.scene.add.text(
            0, 0, // Default to center
            this.cardInfo.value.toString(),
            {
                font: `bold ${this.fontSize}px Arial`,
                fill: '#000000'
            }
        );

        // Position and set origin based on the new centerText option
        if (this.centerText) {
            this.valueText.setOrigin(0.5, 0.5); // Center the origin
            this.valueText.setPosition(0, 0); // Position at container's center
        } else {
            this.valueText.setOrigin(0, 0); // Top-left origin
            this.valueText.setPosition(-this.width / 2 + 10, -this.height / 2 + 10); // Position in top-left corner
        }
        
        // Add visual elements to the correct container (either the main one or the offset one).
        const parentForVisuals = this.offsetContainer || this.container;
        parentForVisuals.add([this.cardRect, this.valueText]);


        // Create the 'flipped' text and add it to the same container as other visuals.
        this.flippedText = this.scene.add.text(
            0, 0, 'XX', {
                font: `bold ${this.height * 0.3}px Arial`, // Make it big
                fill: '#ff0000',
                align: 'center'
            }
        ).setOrigin(0.5);
        parentForVisuals.add(this.flippedText);

        // Set initial visibility based on the isFlipped state
        this.valueText.setVisible(!this.isFlipped);
        this.flippedText.setVisible(this.isFlipped);

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
        
        this.container.on('pointerup', () => {
            this.onPointerUp();
        });
        this.container.on('pointerupoutside', () => {
            this.onPointerUp();
        });
        this.container.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                if (this.allowViewscreen) {
                    this.showViewscreen();
                }
                // If allowViewscreen is false, do nothing on right-click.
            } else { // This is now explicitly a left-click (or middle-click)
                this.onPointerDown(); // Handle the "push down" effect

                if (this.onClick) {
                    this.onClick();
                } else {
                    // Default behavior if no onClick is provided is to flip
                    this.flip();
                    if (this.onFlip) this.onFlip();
                }
            }
        });
    }
    
    onHoverStart() {
        this.isHovered = true;
        // Don't start a hover animation if the card is in the middle of flipping
        if (this.isFlipping) {
            return;
        }

        // Stop any existing tweens on this card to prevent conflicts
        this.scene.tweens.killTweensOf([this.container, this.offsetContainer]);

        // Determine the target for the tween.
        // We scale the main container but move the offset container.
        const scaleTarget = this.container;
        const moveTarget = this.offsetContainer;
        
        // Add y movement if move distance is specified
        if (this.hoverMoveDistance !== 0) {
            this.scene.tweens.add({ targets: moveTarget, y: -this.hoverMoveDistance, duration: this.hoverInDuration, ease: 'Power2.easeOut' });
        }
        
        // The scale tween should always run on the main container.
        // If there's no move tween, we still need to run the scale tween.
        if (this.hoverZoom !== 1) {
            this.scene.tweens.add({ targets: scaleTarget, scale: this.hoverZoom, duration: this.hoverInDuration, ease: 'Power2.easeOut' });
        }


        // Add glow effect if enabled
        if (this.hoverGlow) {
            this.cardRect.setStrokeStyle(3, 0xffff00);
        }
        
        if (this.onHover) {
            this.onHover();
        }
    }
    
    onHoverEnd() {
        this.isHovered = false;
        // Don't start an un-hover animation if the card is in the middle of flipping
        if (this.isFlipping) {
            return;
        }

        // Stop any existing tweens on this card to prevent conflicts
        this.scene.tweens.killTweensOf([this.container, this.offsetContainer]);

        const tweenConfig = {
            duration: this.hoverOutDuration,
            ease: 'Sine.easeOut',
            scale: 1
        };
        
        // We always scale the main container back to 1.
        this.scene.tweens.add({
            ...tweenConfig,
            targets: this.container
        });

        // Only tween the y position back if it was moved in the first place
        if (this.offsetContainer) {
            this.scene.tweens.add({
                targets: this.offsetContainer,
                y: 0, // Return to original offset
                duration: this.hoverOutDuration, ease: 'Sine.easeOut' });
        }
        
        // Remove glow effect
        if (!this.isSelected) {
            this.cardRect.setStrokeStyle(2, 0x000000);
        }
        
        if (this.onUnhover) {
            this.onUnhover();
        }
    }
    
    /**
     * Updates the visual state of the card based on its selection status.
     * @param {boolean} isSelected - The new selection state.
     */
    setSelected(isSelected) {
        this.isSelected = isSelected;

        if (this.isSelected) {
            // When selecting, we want an immediate visual change, so killing tweens is okay.
            this.scene.tweens.killTweensOf(this.container);
            this.cardRect.setStrokeStyle(4, 0xffa500, 1); // Orange glow for selected
        } else {
            // When deselecting, check if an 'unhover' animation is active.
            // If so, let it finish and just set the final border style.
            const activeTweens = this.scene.tweens.getTweensOf(this.container);
            if (activeTweens.length > 0) {
                // An animation is running. Don't kill it.
                // Instead, set the border style when it completes.
                activeTweens[0].once('complete', () => {
                    this.cardRect.setStrokeStyle(2, 0x000000);
                });
            }
            this.cardRect.setStrokeStyle(2, 0x000000); // Set default black border immediately
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
                interactive: true, // It's interactive to block clicks to the overlay
                allowViewscreen: false, // Explicitly disable opening another viewscreen
                isFlipped: this.isFlipped, // Pass the flipped state to the large card
                cardInfoSource: this.cardInfo.type // Pass the source ('player' or 'grid')
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
