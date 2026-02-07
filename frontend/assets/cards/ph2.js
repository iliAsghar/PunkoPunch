window.CARD_DATA['ph2'] = {
    id: 'ph2',
    name: 'Placeholder 2',
    value: 2,
    type: 'player',
    description: 'A basic placeholder card.',

    // Cost to play this card
    cost: {
        mana: 2,
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