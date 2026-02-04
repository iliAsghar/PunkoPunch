class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Start button
        const startBtn = this.add.rectangle(width / 2, height / 2, 200, 60, 0x000000)
            .setInteractive()
            .on('pointerover', function() {
                this.setFillStyle(0x333333);
                this.setScale(1.05);
            })
            .on('pointerout', function() {
                this.setFillStyle(0x000000);
                this.setScale(1);
            })
            .on('pointerdown', () => {
                // Pass game settings when starting the game scene.
                // This is where a value from an input field would be read.
                this.scene.start('GameScene', { 
                    maxPlayersPerTeam: 2 // Using a default of 2 for now
                });
            });
        
        this.add.text(width / 2, height / 2, 'Start', {
            font: '32px Arial',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
