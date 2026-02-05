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

        // Card value text
        this.valueText = this.scene.add.text(
            0, 0,
            this.cardInfo.value.toString(),
            { font: `bold ${this.fontSize}px Arial`, fill: '#000000' }
        );

        if (this.centerText) {
            this.valueText.setOrigin(0.5, 0.5).setPosition(0, 0);
        } else {
            this.valueText.setOrigin(0, 0).setPosition(-this.width / 2 + 10, -this.height / 2 + 10);
        }

        const parentForVisuals = this.offsetContainer || this.container;
        parentForVisuals.add([this.cardRect, this.valueText]);

        this.flippedText = this.scene.add.text(0, 0, 'XX', {
            font: `bold ${this.height * 0.3}px Arial`,
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        parentForVisuals.add(this.flippedText);

        this.valueText.setVisible(!this.isFlipped);
        this.flippedText.setVisible(this.isFlipped);

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
        this.container.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                if (this.allowViewscreen) {
                    this.showViewscreen();
                }
            } else {
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
                this.valueText.setVisible(!this.isFlipped);
                this.flippedText.setVisible(this.isFlipped);

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

        this.scene.tweens.killTweensOf([this.container, this.offsetContainer]);

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

        this.scene.tweens.killTweensOf([this.container, this.offsetContainer]);

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
            });

            card.getContainer().on('pointerdown', (pointer) => {
                pointer.stopPropagation();
            });
            return card;
        };

        drawModalContents();

        this.scene.scale.on('resize', drawModalContents, this);

        const closeModal = () => {
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