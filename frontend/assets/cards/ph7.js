window.CARD_DATA['ph7'] = {
    id: 'ph7',
    name: 'Placeholder 7',
    value: 7,
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
    play: function(gameManager, target) {
        gameManager.effectManager.damagePlayer(target, this.value);
    }
};