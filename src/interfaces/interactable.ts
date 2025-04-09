import type { Player } from 'hytopia';

/**
 * Interface for entities that the player can interact with.
 */
export interface Interactable {
    /**
     * Returns the text to display in the interaction prompt UI.
     * Example: "[E] Examine"
     */
    getInteractText(): string;

    /**
     * Executes the interaction logic when the player presses the interact key.
     * @param player The player entity that initiated the interaction.
     */
    interact(player: Player): void;
} 