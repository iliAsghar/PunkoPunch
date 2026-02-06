/**
 * BaseCard - A foundational class for all card types in the game.
 * It handles common visual elements, animations (hover, flip), and interactions.
 * It is not meant to be instantiated directly but extended by specific card types like HandCard or GridCard.
 */
class BaseCard {
    constructor(scene, x, y, cardId, cardInfo, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.cardId = cardId;
        this.cardInfo = cardInfo;

        // Options with defaults
        this.width = options.width || 120;
        this.height = options.height || 180;
        this.fontSize = options.fontSize || 28;
        this.rotation = options.rotation || 0;
        this.interactive = options.interactive !== false;
        this.onClick = options.onClick;
        this.onFlip = options.onFlip;
        this.centerText = options.centerText || false;
        this.allowViewscreen = options.allowViewscreen !== false;
        this.isFlipping = false;
        this.isFlipped = options.isFlipped || false;
        this.isHovered = false;
        this.isSelected = options.isSelected || false;

        // Hover effect parameters
        this.hoverMoveDistance = options.hoverMoveDistance || 0;
        this.hoverZoom = options.hoverZoom || 1;
        this.hoverGlow = options.hoverGlow;
        this.hoverInDuration = options.hoverInDuration || 40;
        this.hoverOutDuration = options.hoverOutDuration || 300;

        // The main container holds everything and is used for positioning and interactivity.
        this.container = this.scene.add.container(x, y);

        // The offset container holds the visual elements. It will be moved up/down on hover.
        this.offsetContainer = this.hoverMoveDistance !== 0 ? this.scene.add.container(0, 0) : null;
        if (this.offsetContainer) this.container.add(this.offsetContainer);

        // Card background
        this.cardRect = this.scene.add.rectangle(0, 0, this.width, this.height, 0xffffff);
        if (this.isSelected) {
            this.cardRect.setStrokeStyle(4, 0xffa500, 1); // Orange glow for selected
        } else {
            this.cardRect.setStrokeStyle(2, 0x000000); // Default black border
        }

        const parentForVisuals = this.offsetContainer || this.container;
        parentForVisuals.add(this.cardRect);

        // Containers for card faces
        this.faceContentContainer = this.scene.add.container(0, 0);
        this.backContentContainer = this.scene.add.container(0, 0);
        parentForVisuals.add([this.faceContentContainer, this.backContentContainer]);

        // Back of card content (common to all cards)
        const flippedText = this.scene.add.text(0, 0, 'XX', {
            font: `bold ${this.height * 0.3}px Arial`,
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        this.backContentContainer.add(flippedText);

        // Subclasses must implement this to populate the faceContentContainer
        this._createCardContent();

        // Set initial visibility based on isFlipped
        this.faceContentContainer.setVisible(!this.isFlipped);
        this.backContentContainer.setVisible(this.isFlipped);

        this.container.setRotation(this.rotation);

        if (this.interactive) {
            this.setupInteractivity();
        }
    }

    setupInteractivity() {
        this.container.setInteractive(
            new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height),
            Phaser.Geom.Rectangle.Contains
        );

        this.container.on('pointerover', () => this.onHoverStart());
        this.container.on('pointerout', () => this.onHoverEnd());
        this.container.on('pointerup', () => this.onPointerUp());
        this.container.on('pointerupoutside', () => this.onPointerUp());
        // A 'pointerdown' event on a GameObject provides (pointer, localX, localY, event)
        // We need both the pointer and the DOM event.
        this.container.on('pointerdown', (pointer, localX, localY, event) => {
            // Prevent any interaction if a card is currently being drawn or played/discarded.
            const gameManager = this.scene.gameManager;
            if (gameManager) {
                const isDrawing = gameManager.handManager?.isDrawing;
                const isPlaying = gameManager.playManager?.isPlaying;
                if (isDrawing || isPlaying) {
                    return; // Abort click processing
                }
            }


            if (pointer.rightButtonDown()) {
                if (this.allowViewscreen) {
                    this.showViewscreen();
                }
            } else {
                // Stop the event from propagating to the overlay if this card is inside a modal.
                this.onPointerDown();
                if (this.onClick) {
                    this.onClick();
                }
            }
        });
    }

    onPointerDown() {
        if (this.isFlipping) return;
        this.scene.tweens.killTweensOf(this.container);
        const pressDownScale = this.hoverZoom * 0.95;
        this.scene.tweens.add({
            targets: this.container,
            scaleX: pressDownScale,
            scaleY: pressDownScale,
            duration: 50,
            ease: 'Power1'
        });
    }

    onPointerUp() {
        if (this.isFlipping) return;
        if (this.isHovered) {
            this.onHoverStart();
        } else {
            this.onHoverEnd();
        }
    }

    flip() {
        if (this.isFlipping) return;
        this.isFlipping = true;
        this.container.disableInteractive();
        this.scene.tweens.killTweensOf(this.container);

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0,
            duration: 150,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.isFlipped = !this.isFlipped;
                this.faceContentContainer.setVisible(!this.isFlipped);
                this.backContentContainer.setVisible(this.isFlipped);

                const finalScale = this.isHovered ? this.hoverZoom : 1;
                const finalTweenConfig = {
                    targets: this.container,
                    scaleX: finalScale,
                    scaleY: finalScale,
                    duration: 150,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        this.isFlipping = false;
                        this.container.setInteractive();
                        if (this.onFlip) this.onFlip(); // Call onFlip after animation completes
                    }
                };

                if (this.offsetContainer) {
                    const targetY = this.isHovered ? -this.hoverMoveDistance : 0;
                    finalTweenConfig.y = targetY;
                } else if (this.hoverMoveDistance !== 0) {
                    finalTweenConfig.y = this.isHovered ? this.y - this.hoverMoveDistance : this.y;
                }

                this.scene.tweens.add(finalTweenConfig);
            }
        });
    }

    onHoverStart() {
        this.isHovered = true;
        if (this.isFlipping) return;

        // Stop any previous hover-specific tweens to prevent conflicts.
        this.scene.tweens.getTweensOf([this.container, this.offsetContainer]).forEach(tween => {
            // A hover tween animates 'scale' on the main container...
            const isHoverScaleTween = tween.hasTarget(this.container) && tween.data.some(d => d.key === 'scale');
            // ...or 'y' on the offset container.
            const isHoverMoveTween = this.offsetContainer && tween.hasTarget(this.offsetContainer) && tween.data.some(d => d.key === 'y');

            if (isHoverScaleTween || isHoverMoveTween) {
                tween.stop();
            }
        });

        const scaleTarget = this.container;
        const moveTarget = this.offsetContainer;

        if (this.hoverMoveDistance !== 0) {
            this.scene.tweens.add({ targets: moveTarget, y: -this.hoverMoveDistance, duration: this.hoverInDuration, ease: 'Power2.easeOut' });
        }

        if (this.hoverZoom !== 1) {
            this.scene.tweens.add({ targets: scaleTarget, scale: this.hoverZoom, duration: this.hoverInDuration, ease: 'Power2.easeOut' });
        }

        if (this.hoverGlow) {
            this.cardRect.setStrokeStyle(3, 0xffff00);
        }
    }

    onHoverEnd() {
        this.isHovered = false;
        if (this.isFlipping) return;

        // Stop any active hover-in tweens before starting the hover-out animation.
        this.scene.tweens.getTweensOf([this.container, this.offsetContainer]).forEach(tween => {
            const isHoverScaleTween = tween.hasTarget(this.container) && tween.data.some(d => d.key === 'scale');
            const isHoverMoveTween = this.offsetContainer && tween.hasTarget(this.offsetContainer) && tween.data.some(d => d.key === 'y');

            if (isHoverScaleTween || isHoverMoveTween) {
                tween.stop();
            }
        });

        const tweenConfig = {
            duration: this.hoverOutDuration,
            ease: 'Sine.easeOut',
            scale: 1
        };

        this.scene.tweens.add({ ...tweenConfig, targets: this.container });

        if (this.offsetContainer) {
            this.scene.tweens.add({
                targets: this.offsetContainer,
                y: 0,
                duration: this.hoverOutDuration, ease: 'Sine.easeOut'
            });
        }

        if (!this.isSelected) {
            this.cardRect.setStrokeStyle(2, 0x000000);
        }
    }

    setSelected(isSelected) {
        this.isSelected = isSelected;

        if (this.isSelected) {
            this.scene.tweens.killTweensOf(this.container);
            this.cardRect.setStrokeStyle(4, 0xffa500, 1);
        } else {
            const activeTweens = this.scene.tweens.getTweensOf(this.container);
            if (activeTweens.length > 0) {
                activeTweens[0].once('complete', () => {
                    this.cardRect.setStrokeStyle(2, 0x000000);
                });
            }
            this.cardRect.setStrokeStyle(2, 0x000000);
        }
    }

    /**
     * Abstract method for subclasses to implement.
     * This is where card-specific visuals (text, icons, etc.) should be created and added to `this.faceContentContainer`.
     */
    _createCardContent() {
        throw new Error("_createCardContent() must be implemented by subclasses.");
    }

    /**
     * This method must be implemented by subclasses to create a new instance
     * of the correct card type for the viewscreen.
     */
    createViewscreenCard(options) {
        throw new Error("createViewscreenCard() must be implemented by subclasses.");
    }

    showViewscreen() {
        const viewscreenContainer = this.scene.add.container(0, 0);
        viewscreenContainer.setDepth(100).setScrollFactor(0);

        const drawModalContents = () => {
            viewscreenContainer.removeAll(true);

            const currentWidth = this.scene.cameras.main.width;
            const currentHeight = this.scene.cameras.main.height;

            viewscreenContainer.add(createOverlay(currentWidth, currentHeight));

            const contentContainer = this.scene.add.container(0, 0);
            viewscreenContainer.add(contentContainer);

            contentContainer.add(createLargeCard().getContainer());
            contentContainer.setPosition(currentWidth / 2, currentHeight / 2);
        };

        const createOverlay = (w, h) => {
            return this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
                .setInteractive()
                .on('pointerdown', () => closeModal());
        };

        const createLargeCard = () => {
            const largeCardHeight = this.scene.cameras.main.height * 0.8;
            const largeCardWidth = largeCardHeight * (this.width / this.height);

            // Use the subclass's implementation to create the correct card type
            const card = this.createViewscreenCard({
                width: largeCardWidth,
                height: largeCardHeight,
                fontSize: 64,
                interactive: true,
                allowViewscreen: false,
                isFlipped: this.isFlipped,
                hoverMoveDistance: 0, // Disable hover movement
                hoverZoom: 1,         // Disable hover zoom
                // Set the click action for the large card to be a flip.
                // This will apply to both HandCards and GridCards in viewscreen mode.
                onClick: () => card.flip()
            });

            // When a GameObject is clicked, Phaser emits 'pointerdown' with (gameObject, pointer, event).
            // We need the third argument, the DOM event, to stop propagation to the overlay.
            // This listener is now redundant because the main listener in setupInteractivity handles it.
            /* card.getContainer().on('pointerdown', (gameObject, pointer, event) => {
                // This prevents the click from bubbling up to the overlay and closing the modal.
                event.stopPropagation();
            }); */
            return card;
        };

        drawModalContents();

        this.scene.scale.on('resize', drawModalContents, this);

        const closeModal = () => {
            // Find the card instance within the viewscreen to stop its animations.
            // This prevents errors if the modal is closed while the card is flipping.
            const largeCardContainer = viewscreenContainer.getAt(1)?.getAt(0);
            if (largeCardContainer) {
                this.scene.tweens.killTweensOf(largeCardContainer);
            }
            this.scene.tweens.add({
                targets: viewscreenContainer,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    viewscreenContainer.destroy();
                    this.scene.scale.off('resize', drawModalContents, this);
                    this.scene.input.keyboard.off('keydown-ESC', onEsc);
                }
            });
        };

        const onEsc = () => closeModal();
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