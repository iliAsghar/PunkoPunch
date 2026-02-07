window.CARD_DATA['ph10'] = {
    id: 'ph10',
    name: 'Placeholder 10',
    value: 10,
    type: 'player',
    description: 'A basic placeholder card.',

    // Cost to play this card
    cost: {
        mana: 3,
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