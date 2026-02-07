class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 2 - 300, "thanks for testing this you goob! ;D", {
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
        inputElement.max = '4';
        inputElement.style.width = '80px';
        inputElement.style.fontSize = '20px';
        inputElement.style.textAlign = 'center';

        this.add.dom(width / 2, height / 2, inputElement);

        // --- Debug Mode Checkbox ---
        const debugContainer = document.createElement('div');
        debugContainer.style.display = 'flex';
        debugContainer.style.alignItems = 'center';
        debugContainer.style.justifyContent = 'center';
        debugContainer.style.fontSize = '20px';
        debugContainer.style.color = '#333';

        const debugCheckbox = document.createElement('input');
        debugCheckbox.type = 'checkbox';
        debugCheckbox.id = 'debugModeCheckbox';
        debugCheckbox.style.marginRight = '10px';
        debugCheckbox.checked = true; // Default to on

        const debugLabel = document.createElement('label');
        debugLabel.htmlFor = 'debugModeCheckbox';
        debugLabel.innerText = 'Debug Mode';

        debugContainer.appendChild(debugCheckbox);
        debugContainer.appendChild(debugLabel);

        this.add.dom(width / 2, height / 2 + 45, debugContainer);

        // --- Start Game Button ---
        const startButton = this.add.text(width / 2, height / 2 + 95, 'Start Game', {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) return;
            const maxPlayers = Math.min(parseInt(inputElement.value, 10) || 2, 4); // Fallback to 2 if input is invalid, max of 4
            const isDebugMode = debugCheckbox.checked;
            this.scene.start('GameScene', {
                maxPlayersPerTeam: maxPlayers,
                debugMode: isDebugMode
            });
        });

        startButton.on('pointerover', () => startButton.setBackgroundColor('#333333'));
        startButton.on('pointerout', () => startButton.setBackgroundColor('#000000'));
    }
}
