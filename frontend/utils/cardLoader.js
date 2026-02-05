/**
 * cardLoader.js
 * 
 * This script dynamically loads all player card files listed in the card-manifest.js,
 * and then proceeds to load the rest of the game's scripts in the correct order.
 * This avoids having to manually add every card file to index.html.
 */
(function() {
    const cardManifestPath = 'frontend/assets/cards/card-manifest.js';
    const cardBasePath = 'frontend/assets/cards/';

    // List of all other game scripts that need to be loaded AFTER the cards.
    // The order here is important.
    const gameScripts = [
        'frontend/assets/cardDictionary.js',
        'frontend/assets/gridCardDictionary.js',
        'frontend/models/Player.js',
        'frontend/ui/PlayerStatsUI.js',
        'frontend/components/BaseCard.js',
        'frontend/components/HandCard.js',
        'frontend/components/GridCard.js',
        'frontend/managers/GridManager.js',
        'frontend/managers/HandManager.js',
        'frontend/managers/PileManager.js',
        'frontend/managers/PlayManager.js',
        'frontend/managers/GameManager.js',
        'frontend/scenes/MenuScene.js',
        'frontend/scenes/GameScene.js',
        'frontend/phaser.config.js',
        'frontend/main.js'
    ];

    // Function to load a script and return a promise
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Script load error for ${src}`));
            document.head.appendChild(script);
        });
    }

    // Start the loading process
    loadScript(cardManifestPath)
        .then(() => {
            // Once the manifest is loaded, CARD_MANIFEST is available globally.
            const cardFiles = CARD_MANIFEST.map(file => cardBasePath + file);
            const allScriptsToLoad = [...cardFiles, ...gameScripts];

            // Load all scripts sequentially.
            let promiseChain = Promise.resolve();
            allScriptsToLoad.forEach(scriptSrc => {
                promiseChain = promiseChain.then(() => loadScript(scriptSrc));
            });

            return promiseChain;
        })
        .catch(error => {
            console.error("Failed to load initial game scripts:", error);
        });
})();