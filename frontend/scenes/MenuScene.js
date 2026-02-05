class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 2 - 300, "thanks for testing this. I'm talking to you sith! ;D", {
            font: 'bold 32px Arial',
            fill: '#000000'
        }).setOrigin(0.5);

        // Game Title
        this.add.text(width / 2, height / 2 - 150, 'PunkoPunch', {
            font: 'bold 64px Arial',
            fill: '#000000'
        }).setOrigin(0.5);

        // --- Max Players Input ---
        this.add.text(width / 2, height / 2 - 50, 'Max Players per Team:', {
            font: '24px Arial',
            fill: '#333333'
        }).setOrigin(0.5);

        // We use an HTML input element for text entry
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.value = '2'; // Default value
        inputElement.min = '1';
        inputElement.max = '5';
        inputElement.style.width = '80px';
        inputElement.style.fontSize = '20px';
        inputElement.style.textAlign = 'center';

        this.add.dom(width / 2, height / 2, inputElement);

        // --- Start Game Button ---
        const startButton = this.add.text(width / 2, height / 2 + 80, 'Start Game', {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) return;
            const maxPlayers = parseInt(inputElement.value, 10) || 2; // Fallback to 2 if input is invalid
            this.scene.start('GameScene', { maxPlayersPerTeam: maxPlayers });
        });

        startButton.on('pointerover', () => startButton.setBackgroundColor('#333333'));
        startButton.on('pointerout', () => startButton.setBackgroundColor('#000000'));
    }
}
