/**
 * PlayerStatsUI - Displays a player's HP and Mana.
 */
class PlayerStatsUI {
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

        // Style for the text to make it readable
        const textStyle = { 
            font: 'bold 24px Arial', 
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        };

        this.hpText = scene.add.text(0, 0, '', textStyle);
        this.manaText = scene.add.text(0, 30, '', textStyle);

        this.container.add([this.hpText, this.manaText]);
    }

    /**
     * Updates the displayed stats from a Player object.
     * @param {Player} player - The player data to display.
     */
    update(player) {
        if (!player) return;
        this.hpText.setText(`HP: ${player.hp} / ${player.maxHp}`);
        this.manaText.setText(`Mana: ${player.mana} / ${player.maxMana}`);
    }

    /**
     * Destroys the UI elements.
     */
    destroy() {
        this.container.destroy();
    }
}