// Main entry point for the frontend
// Socket connection is initialized in gameUtils.js
// Scenes and game config are loaded via script tags in index.html

// Wait for the game instance to be ready
window.addEventListener('load', () => {
    if (window.gameInstance && window.gameInstance.canvas) {
        // Prevent the default browser right-click menu on the game canvas
        window.gameInstance.canvas.oncontextmenu = (e) => e.preventDefault();
    }
});
