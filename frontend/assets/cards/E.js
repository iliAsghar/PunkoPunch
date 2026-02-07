window.CARD_DATA['ph6'] = {
    id: 'ph6',
    name: 'Attack E',
    value: 6,
    type: 'Attack',
    description: 'Deal {value} damage to an enemy.',

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