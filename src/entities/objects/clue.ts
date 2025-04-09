import { Vector3, World, type Vector3Like, Entity, Player, RigidBodyType, ColliderShape } from "hytopia";
// import { Entity as BaseEntity } from "../base/entity"; // REMOVED - Incorrect base
// import { InteractableEntity } from "../base/interactable-entity"; // ASSUMED PATH - Use this as the base class
import type { Interactable } from "../../interfaces/interactable";
import { SherlockPlayerController } from "../controllers/sherlock-controller";
import { logger } from "../../utils/logger";
// import { PlayerEntity } from '../base/player-entity'; // REMOVED - Not directly needed here

const CLUE_TEXT = "You found a mysterious clue! It appears to be important.";
const CLUE_MODEL_URI = "models/items/compass.glb"; // Use compass to avoid crash

/**
 * Represents an interactable clue object in the world.
 * Extends Hytopia.Entity directly and implements Interactable.
 */
export class ClueEntity extends Entity implements Interactable {
    protected _hytopiaEntity: Entity | null = null; // Reference to the spawned entity (itself)
    private _initialPosition: Vector3;

    constructor(position: Vector3) {
        // Define options for the base Entity constructor
        const entityOptions = {
            name: `ClueObject-${position.x}-${position.z}`,
            modelUri: CLUE_MODEL_URI,
            modelScale: 0.5,
            rigidBodyOptions: {
                type: RigidBodyType.FIXED,
            },
        };
        super(entityOptions); // Call base Entity constructor

        this._initialPosition = position; // Store position for spawning
        logger.info(`[ClueEntity] Constructed: ${this.name} at ${position.toString()}`);
    }

    /**
     * Spawns the entity in the world. 
     */
    public spawn(world: World): void { 
        if (this._hytopiaEntity && this._hytopiaEntity.isSpawned) { // Check if already spawned
            logger.warn(`ClueEntity ${this.id} already spawned. Ignoring spawn call.`);
            return;
        }
        
        try {
            super.spawn(world, this._initialPosition); // Call base Entity spawn
            this._hytopiaEntity = this; // `this` is the spawned entity

            // Add collider AFTER spawn
            const colliderOptions = {
                shape: ColliderShape.BLOCK,
                halfExtents: new Vector3(0.25, 0.25, 0.25),
                isTrigger: true,
                tag: "ClueInteractionTrigger"
            };
            this.createAndAddChildCollider(colliderOptions); // Call directly on `this`

            logger.info(`Spawned ClueEntity ${this.id} and added collider at ${this._initialPosition.toString()}`);
        } catch (error) {
            logger.error(`Failed to spawn ClueEntity ${this.name} or add collider`, error);
            this._hytopiaEntity = null; // Clear reference on failure
        }
    }
    
    /**
     * Despawns the entity from the world.
     */
    public despawn(): void { 
        if (!this.isSpawned) { // Use inherited isSpawned getter
            logger.warn(`ClueEntity ${this.name} is not spawned or already despawned.`);
            return;
        }
        try {
            super.despawn(); // Call base Entity despawn
            logger.info(`Despawned ClueEntity ${this.id}.`);
            this._hytopiaEntity = null; // Clear reference
        } catch (error) {
             logger.error(`Error despawning ClueEntity ${this.id}`, error);
             this._hytopiaEntity = null; // Ensure reference is cleared on error too
        }
    }

    // --- Interactable Implementation ---

    public getInteractText(): string {
        return "Examine Clue [E]";
    }

    public interact(player: Player): void {
        if (!this.isSpawned) { // Check using inherited getter
            logger.error(`Cannot interact with ClueEntity: Not spawned.`);
            return;
        }
        // Use inherited this.id
        logger.info(`Player ${player.id} interacted with ClueEntity ${this.id}.`); 

        const world = player.world; 
        if (!world) {
            logger.error(`Player ${player.id} has no world reference during interaction.`);
            return;
        }

        // 1. Send chat message
        world.chatManager.sendPlayerMessage(player, CLUE_TEXT);

        // 2. Get the player's controller instance
        const playerEntity = world.entityManager.getPlayerEntitiesByPlayer(player)[0];
        if (playerEntity?.controller instanceof SherlockPlayerController) {
            const controller = playerEntity.controller;
            // 3. Call the controller method to add the entry
            controller.addNotebookEntry(CLUE_TEXT);
            logger.info(`Called addNotebookEntry on controller for player ${player.id}.`);
            world.chatManager.sendPlayerMessage(player, "This clue has been added to your notebook!", "FFCC00");
        } else {
            logger.error(`Could not find SherlockPlayerController for player ${player.id} during clue interaction.`);
            world.chatManager.sendPlayerMessage(player, "Error adding clue to notebook.", "FF0000");
        }
    }
} 