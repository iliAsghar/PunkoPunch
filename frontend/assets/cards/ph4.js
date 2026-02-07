window.CARD_DATA['ph4'] = {
    id: 'ph4',
    name: 'Placeholder 4',
    value: 4,
    type: 'player',
    description: 'A basic placeholder card.',

    // Cost to play this card
    cost: {
        mana: 9,
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