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
        const displayName = isCurrentPlayer ? `${player.name} (you)` : player.name;
        this.nameText.setText(displayName);
        if (player.hp <= 0) {
            // When a player is defeated, immediately clear any targeting/hover effects.
            this.clearAllHighlights();
            this.hpText.setText('Defeated');
            this.hpText.setStyle({ fill: '#ff4d4d' }); // Red color for defeated status
        } else {
            this.hpText.setText(`HP: ${player.hp} / ${player.maxHp}`);
            this.hpText.setStyle({ fill: '#f0f0f0' }); // Reset to default color
        }
        this.isCurrentPlayer = isCurrentPlayer;
        this.drawBackground();
    }

    /**
     * Sets the highlight state for the UI.
     * @param {boolean} state The state to set (true or false).
     * @param {'target' | 'hover'} type The type of highlight.
     * @param {object} [options] - Optional parameters.
     * @param {number} [options.syncDelay] - A delay for synchronized animations.
     */
    setHighlight(state, type, options = {}) {
        const playerIsDead = this.hpText.text === 'Defeated';
        // Dead players cannot be targeted or hovered.
        if (playerIsDead) return;

        if (type === 'target') {
            if (this.isTargetable === state) return; // No change needed
            this.isTargetable = state;
            if (state && !this.isHovered) {
                this.startWobble(options.syncDelay);
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
                    // When un-hovering, restart the wobble with the original sync delay.
                    const restartWobble = () => {
                        // Check isTargetable again in case targeting mode ended while hovering.
                        if (this.isTargetable) this.startWobble(options.syncDelay);
                    };
                    this.scene.tweens.add({ targets: this.container, scale: 1, duration: 100, ease: 'Power2', onComplete: restartWobble });
                }
            }
        }

        this.drawBackground();
    }

    /**
     * Draws or redraws the background based on its current state.
     */
    drawBackground() {
        const playerIsDead = this.hpText.text === 'Defeated';

        this.background.clear();
        if (playerIsDead) {
            this.background.fillStyle(0x1a1a1a, 0.8); // Darker, more opaque background for dead players
        } else {
            this.background.fillStyle(0x000000, 0.6);
        }

        this.background.fillRoundedRect(-90, -30, 180, 60, 8);

        // The border color is determined by priority: hover > targetable > current player
        if (this.isHovered) {
            this.background.lineStyle(3, 0x00ff00, 1); // Bright green for hover. This takes priority over other borders.
            this.background.strokeRoundedRect(-90, -30, 180, 60, 8);
        }
    }

    /**
     * Forcefully removes all highlight states (target, hover) and stops animations.
     */
    clearAllHighlights() {
        // If the player is dead, highlights are already disabled, but this ensures a clean state.
        const playerIsDead = this.hpText.text === 'Defeated';
        if (playerIsDead) return;

        this.isTargetable = false;
        this.isHovered = false;
        this.stopWobble();
        // Reset scale in case it was stuck in a hover-up state.
        this.container.setScale(1);
        this.drawBackground();
    }

    /**
     * Starts a continuous wobble animation to indicate a valid target.
     * @param {number} [syncDelay] - An optional delay to synchronize animations across multiple UIs.
     */
    startWobble(syncDelay) {
        if (this.wobbleTween) return; // Already wobbling

        this.wobbleTween = this.scene.tweens.add({
            targets: this.container,
            scale: 1.05, // Zoom in slightly
            duration: 400, // Duration of one pulse
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            // Use provided syncDelay or a random one for desynchronization.
            delay: syncDelay !== undefined ? syncDelay : Math.random() * 400
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