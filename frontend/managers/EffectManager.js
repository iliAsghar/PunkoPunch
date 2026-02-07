/**
 * EffectManager - Handles the execution of card effects and abilities.
 * This class centralizes game state modifications like damage, healing, buffs, etc.
 */
class EffectManager {
    /**
     * @param {GameManager} gameManager The main game manager instance.
     */
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    /**
     * Applies damage to a single player.
     * @param {Player} player The target player object.
     * @param {number} value The amount of damage to deal.
     */
    damagePlayer(player, value) {
        if (!player) return;
        console.log(`Applying ${value} damage to ${player.name}`);
        this.gameManager.applyDamage(player.playerId, value);
    }

    /**
     * Applies damage to a card on the board.
     * @param {GridCard} targetCard The target card object on the grid.
     * @param {number} value The amount of damage to deal.
     */
    damageBoardCard(targetCard, value) {
        // TODO: Implement HP and damage logic for GridCards.
        console.log(`Applying ${value} damage to board card:`, targetCard);
    }

    /**
     * Applies damage to all members of a specific team.
     * @param {string} teamId The ID of the target team ('A' or 'B').
     * @param {number} value The amount of damage to deal to each member.
     */
    damageTeam(teamId, value) {
        console.log(`Applying ${value} damage to all of Team ${teamId}`);
        this.gameManager.players.forEach(player => {
            if (player.team === teamId) {
                this.damagePlayer(player, value);
            }
        });
    }
}