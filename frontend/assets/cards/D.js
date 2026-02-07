window.CARD_DATA['D'] = {
    id: 'D',
    name: 'Attack D',
    value: 5,
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