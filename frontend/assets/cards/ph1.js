window.CARD_DATA['ph1'] = {
    id: 'ph1',
    name: 'Quick Jab',
    type: 'Attack',
    description: 'Deal 3 damage to an enemy.',

    // Cost to play this card
    cost: {
        mana: 1,
    },

    // target_type = 'team' / 'player' / 'board' / 'global'
    target_type: 'player',

    // target_scope = 'ally' / 'enemy' / 'any'
    target_scope: 'enemy',

    // Function to execute when the card is played
    play: (gameManager, target) => {
        gameManager.effectManager.damagePlayer(target, 3);
    }
};