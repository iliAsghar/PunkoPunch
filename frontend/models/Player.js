/**
 * Player - A data model for a player's stats and information.
 */
class Player {
    /**
     * @param {string} playerId - The unique identifier for the player.
     * @param {string} name - The display name of the player.
     * @param {number} hp - The current health points.
     * @param {number} maxHp - The maximum health points.
     * @param {number} mana - The current mana points.
     * @param {number} maxMana - The maximum mana points.
     */
    constructor(playerId, name, hp, maxHp, mana, maxMana) {
        this.playerId = playerId;
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.mana = mana;
        this.maxMana = maxMana;
    }

    /**
     * Applies damage to the player.
     * @param {number} amount - The amount of damage to take.
     */
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    /**
     * Heals the player.
     * @param {number} amount - The amount of health to restore.
     */
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    /**
     * Spends mana.
     * @param {number} amount - The amount of mana to use.
     * @returns {boolean} - True if mana was successfully spent, false otherwise.
     */
    useMana(amount) {
        if (this.mana >= amount) {
            this.mana -= amount;
            return true;
        }
        return false;
    }

    /**
     * Restores mana.
     * @param {number} amount - The amount of mana to restore.
     */
    restoreMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }
}