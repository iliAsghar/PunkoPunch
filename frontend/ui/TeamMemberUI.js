/**
 * TeamMemberUI - A compact display for a player's status within a team list.
 */
class TeamMemberUI {
    /**
     * @param {Phaser.Scene} scene - The scene to add the UI to.
     * @param {Phaser.GameObjects.Container} parentContainer - The container to add this UI to.
     * @param {number} x - The x position within the parent container.
     * @param {number} y - The y position within the parent container.
     */
    constructor(scene, parentContainer, x, y) {
        this.scene = scene;
        // Set the container's origin to its center for scaling animations.
        // We adjust the position to account for the new origin.
        this.container = scene.add.container(x + 90, y + 30);
        parentContainer.add(this.container);

        // A background for the UI element to make it stand out
        this.background = scene.add.graphics();
        // Define the interactive area on the background graphic itself. This prevents
        // text elements from interfering with pointer events.
        // The hitArea must also be adjusted for the new centered origin.
        const hitArea = new Phaser.Geom.Rectangle(-90, -30, 180, 60);
        this.background.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.container.add(this.background);

        // Style for the text
        const nameStyle = { font: 'bold 18px Arial', fill: '#ffffff' };
        const hpStyle = { font: '16px Arial', fill: '#f0f0f0' };
 
        // Adjust text positions to be relative to the new center origin.
        this.nameText = scene.add.text(-80, -22, '', nameStyle);
        this.hpText = scene.add.text(-80, 2, '', hpStyle);

        this.container.add([this.nameText, this.hpText]);

        // State for highlighting
        this.isCurrentPlayer = false;
        this.isTargetable = false;
        this.isHovered = false;
        this.wobbleTween = null;

        this.drawBackground(); // Initial draw
    }

    /**
     * Updates the displayed stats from a Player object.
     * @param {Player} player - The player data to display.
     * @param {boolean} isCurrentPlayer - Whether this player is the active turn player.
     */
    update(player, isCurrentPlayer) {
        if (!player) return;
        this.nameText.setText(player.name);
        this.hpText.setText(`HP: ${player.hp} / ${player.maxHp}`);
        this.isCurrentPlayer = isCurrentPlayer;
        this.drawBackground();
    }

    /**
     * Sets the highlight state for the UI.
     * @param {boolean} state The state to set (true or false).
     * @param {'target' | 'hover'} type The type of highlight.
     */
    setHighlight(state, type) {
        if (type === 'target') {
            if (this.isTargetable === state) return; // No change needed
            this.isTargetable = state;
            // If becoming a target and not currently hovered, start wobbling.
            // If no longer a target, stop wobbling.
            if (state && !this.isHovered) {
                this.startWobble();
            } else {
                this.stopWobble();
            }
        } else if (type === 'hover') {
            if (this.isHovered === state) return; // No change needed
            this.isHovered = state;

            // Only apply special hover logic if the element is a target.
            if (this.isTargetable) {
                if (state) { // Hovering over a target
                    this.stopWobble();
                    this.scene.tweens.add({ targets: this.container, scale: 1.1, duration: 100, ease: 'Power2' });
                } else { // Un-hovering from a target
                    this.scene.tweens.add({ targets: this.container, scale: 1, duration: 100, ease: 'Power2', onComplete: () => this.startWobble() });
                }
            }
        }

        this.drawBackground();
    }

    /**
     * Draws or redraws the background based on its current state.
     */
    drawBackground() {
        this.background.clear();
        this.background.fillStyle(0x000000, 0.6);
        this.background.fillRoundedRect(-90, -30, 180, 60, 8);

        // The border color is determined by priority: hover > targetable > current player
        if (this.isHovered) {
            this.background.lineStyle(3, 0x00ff00, 1); // Bright green for hover. This takes priority over other borders.
            this.background.strokeRoundedRect(-90, -30, 180, 60, 8);
        } else if (this.isCurrentPlayer) {
            this.background.lineStyle(3, 0xffd700, 1); // Gold border for highlight
            this.background.strokeRoundedRect(-90, -30, 180, 60, 8);
        }
    }

    /**
     * Forcefully removes all highlight states (target, hover) and stops animations.
     */
    clearAllHighlights() {
        this.isTargetable = false;
        this.isHovered = false;
        this.stopWobble();
        // Reset scale in case it was stuck in a hover-up state.
        this.container.setScale(1);
        this.drawBackground();
    }

    /**
     * Starts a continuous wobble animation to indicate a valid target.
     */
    startWobble() {
        if (this.wobbleTween) return; // Already wobbling

        this.wobbleTween = this.scene.tweens.add({
            targets: this.container,
            scale: 1.05, // Zoom in slightly
            duration: 400, // Duration of one pulse
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            // Random delay makes each target pulse out of sync with the others.
            delay: Math.random() * 400
        });
    }

    /**
     * Stops the wobble animation and resets the rotation.
     */
    stopWobble() {
        if (this.wobbleTween) {
            this.wobbleTween.stop();
            this.wobbleTween = null;
        }
        this.container.setScale(1); // Reset scale
    }

    /**
     * Gets the main container for this UI element.
     */
    getContainer() {
        return this.background;
    }

    /**
     * Destroys the UI elements.
     */
    destroy() {
        this.container.destroy();
    }
}