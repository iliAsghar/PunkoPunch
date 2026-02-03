class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.baseWidth = 1280;
        this.baseHeight = 720;
    }
    
    create() {
        // Create a main container to act as our "virtual canvas"
        this.gameContainer = this.add.container(0, 0);

        // Initialize game manager (handles hand and piles)
        // Pass the main container to the manager
        const gameManager = new GameManager(this, this.gameContainer);
        gameManager.initialize();
        
        // Listen for the resize event from the Scale Manager
        this.scale.on('resize', (gameSize) => {
            this.onResize(gameSize, this.gameContainer);
        }, this);
        
        // Initial resize call to position everything correctly
        this.onResize({ width: this.scale.width, height: this.scale.height }, this.gameContainer);
    }
    
    onResize(gameSize, container) {
        if (!container) return;

        const { width, height } = gameSize;

        // Calculate the scale needed to fit our base resolution (1280x720) into the new window size
        const scale = Math.min(width / this.baseWidth, height / this.baseHeight);
        
        // Apply the scale to our main container
        container.setScale(scale);

        // Center the container on the screen
        container.setPosition(
            (width - (this.baseWidth * scale)) / 2,
            (height - (this.baseHeight * scale)) / 2
        );
    }
}
