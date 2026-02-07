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
        this.container = scene.add.container(x, y);
        parentContainer.add(this.container);

        // Make the container interactive to receive pointer events.
        this.container.setSize(180, 60).setInteractive();

        // A background for the UI element to make it stand out
        this.background = scene.add.graphics();
        this.container.add(this.background);

        // Style for the text
        const nameStyle = { font: 'bold 18px Arial', fill: '#ffffff' };
        const hpStyle = { font: '16px Arial', fill: '#f0f0f0' };

        this.nameText = scene.add.text(10, 8, '', nameStyle);
        this.hpText = scene.add.text(10, 32, '', hpStyle);

        this.container.add([this.nameText, this.hpText]);

        // State for highlighting
        this.isCurrentPlayer = false;
        this.isTargetable = false;
        this.isHovered = false;

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
            this.isTargetable = state;
        } else if (type === 'hover') {
            this.isHovered = state;
        }
        this.drawBackground();
    }

    /**
     * Draws or redraws the background based on its current state.
     */
    drawBackground() {
        this.background.clear();
        this.background.fillStyle(0x000000, 0.6);
        this.background.fillRoundedRect(0, 0, 180, 60, 8);

        // The border color is determined by priority: hover > targetable > current player
        if (this.isHovered) {
            this.background.lineStyle(3, 0x00ff00, 1); // Bright green for hover
            this.background.strokeRoundedRect(0, 0, 180, 60, 8);
        } else if (this.isTargetable) {
            this.background.lineStyle(3, 0xff4500, 1); // Orange-red for targetable
            this.background.strokeRoundedRect(0, 0, 180, 60, 8);
        } else if (this.isCurrentPlayer) {
            this.background.lineStyle(3, 0xffd700, 1); // Gold border for highlight
            this.background.strokeRoundedRect(0, 0, 180, 60, 8);
        }
    }

    /**
     * Gets the main container for this UI element.
     */
    getContainer() {
        return this.container;
    }

    /**
     * Destroys the UI elements.
     */
    destroy() {
        this.container.destroy();
    }
}