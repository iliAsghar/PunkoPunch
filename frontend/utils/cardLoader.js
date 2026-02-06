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
        'frontend/assets/decks/deck1.js', // Load deck definition before GameManager
        'frontend/assets/gridCardDictionary.js',
        'frontend/models/Player.js',
        'frontend/ui/PlayerStatsUI.js',
        'frontend/components/BaseCard.js',
        'frontend/components/HandCard.js',
        'frontend/components/GridCard.js',
        'frontend/managers/GridManager.js',
        'frontend/managers/HandManager.js',
        'frontend/managers/PileManager.js', // This file is named turnmanager.js (lowercase)
        'frontend/managers/turnmanager.js',
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
    // 1. Create the global card data registry.
    window.CARD_DATA = {};

    // 2. Load the card manifest.
    loadScript(cardManifestPath)
        .then(() => {
            // Now CARD_MANIFEST is available globally.
            const cardFiles = CARD_MANIFEST.map(file => cardBasePath + file);

            // Create a promise chain that first loads all card files.
            let cardPromiseChain = Promise.resolve();
            cardFiles.forEach(scriptSrc => {
                cardPromiseChain = cardPromiseChain.then(() => loadScript(scriptSrc));
            });
            
            cardPromiseChain = cardPromiseChain.then(() => {
                // Re-create the getCardInfo utility function globally, as it was previously in cardDictionary.js
                window.getCardInfo = function(cardId) {
                    return window.CARD_DATA[cardId] || {
                        id: cardId,
                        name: 'Unknown Card',
                        value: '??',
                        type: 'unknown',
                        description: 'This card data could not be found.',
                        cost: {},
                        play: () => {
                            console.error(`Play function not found for card ID: ${cardId}`);
                        }
                    };
                };

                // Now load the rest of the game scripts.
                let gameScriptPromiseChain = Promise.resolve();
                gameScripts.forEach(scriptSrc => {
                    gameScriptPromiseChain = gameScriptPromiseChain.then(() => loadScript(scriptSrc));
                });
                return gameScriptPromiseChain;
            });

            return cardPromiseChain;
        })
        .catch(error => {
            console.error("Failed to load initial game scripts:", error);
        });
        
})();