window.CARD_DATA['ph3'] = {
    id: 'ph3',
    name: 'Shockwave',
    type: 'Attack',
    description: 'Deal 1 damage to all enemies.',

    // Cost to play this card
    cost: {
        mana: 0,
    },

    // target_type = 'team' / 'player' / 'board' / 'global'
    target_type: 'team',

    // target_scope = 'ally' / 'enemy' / 'any'
    target_scope: 'enemy',

    // Function to execute when the card is played
    play: (gameManager, target) => {
        if (target) {
            gameManager.effectManager.damageTeam(target.team, 1);
        }
    }
};