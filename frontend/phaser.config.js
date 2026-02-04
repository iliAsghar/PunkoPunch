const config = {
    type: Phaser.AUTO,
    backgroundColor: '#ffffff',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
            // Use integer-based physics calculations for more predictable and potentially faster results
            fps: 60
        }
    },
    audio: {
        disableWebAudio: true
    },
    scene: [MenuScene, GameScene]
};
Object.assign(config, {
    render: {
        pixelArt: true,
        antialias: false
    }
});

window.gameInstance = new Phaser.Game(config);
