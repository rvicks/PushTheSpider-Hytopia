import { Entity, Vector3, World, type Vector3Like, Player, PlayerEntity, RigidBodyType, ColliderShape } from "hytopia";
import { Entity as BaseEntity } from "../base/entity";
import type { Interactable } from "../../interfaces/interactable";
import { logger } from "../../utils/logger"; // Use logger

export interface NotebookEntry {
  text: string;
  timestamp: number;
}

// Define constants for notebook
// const NOTEBOOK_TEXTURE_URI = "blocks/emerald_block.png"; // Original
const NOTEBOOK_TEXTURE_URI = "blocks/stone.png"; // Use placeholder texture
const NOTEBOOK_HALF_EXTENTS = new Vector3(0.3, 0.4, 0.05);
const NOTEBOOK_COLLIDER_HALF_EXTENTS = new Vector3(0.3, 0.4, 0.05); // Match visual size

/**
 * In-game notebook entity that displays clues
 * Implements Interactable interface
 */
export class NotebookEntity extends BaseEntity implements Interactable {
  private entries: NotebookEntry[] = [];
  private isOpen = false; // Keep track of open state if needed for UI
  private _initialPosition: Vector3; // Store initial position

  // id getter uses the inherited _hytopiaEntity
  public get id(): number {
      return this._hytopiaEntity?.id ?? -1;
  }

  constructor(position: Vector3) {
    super(); // Call base constructor
    this._initialPosition = position; // Store position for spawn
    logger.info(`NotebookEntity wrapper created for position ${position.x}, ${position.y}, ${position.z}.`);
  }

  /**
   * Creates and spawns the underlying Hytopia Entity for the notebook.
   */
  public spawn(world: World): void {
      if (this._hytopiaEntity) {
          logger.warn(`NotebookEntity ${this.id} already spawned. Ignoring spawn call.`);
          return;
      }
      
      try {
          // Step 1: Create the block-based Entity
          const newEntity = new Entity({
              name: "NotebookObject",
              blockTextureUri: NOTEBOOK_TEXTURE_URI,
              blockHalfExtents: NOTEBOOK_HALF_EXTENTS,
              rigidBodyOptions: { 
                  type: RigidBodyType.FIXED 
              },
              // Components (like colliders) are added after spawn via specific methods
          });

          // Step 2: Spawn the entity
          newEntity.spawn(world, this._initialPosition);
          this._hytopiaEntity = newEntity; // Store reference

          // Step 3: Add the interaction trigger collider
          const colliderOptions = {
              shape: ColliderShape.BLOCK,
              halfExtents: NOTEBOOK_COLLIDER_HALF_EXTENTS, 
              isTrigger: true,
              tag: "NotebookInteractionTrigger"
          };
          this._hytopiaEntity.createAndAddChildCollider(colliderOptions);

          logger.info(`✅ Spawned Hytopia Entity ${this.id} and added collider for NotebookEntity at ${this._initialPosition.x}, ${this._initialPosition.y}, ${this._initialPosition.z}`);

      } catch (error) {
          logger.error(`❌ Failed to create/spawn Hytopia Entity or add collider for NotebookEntity at ${this._initialPosition.x}, ${this._initialPosition.y}, ${this._initialPosition.z}`, error);
           if (this._hytopiaEntity) {
               this._hytopiaEntity = null;
           }
      }
  }
  
  /**
   * Add an entry to the notebook
   */
  addEntry(text: string): void {
    this.entries.push({
      text,
      timestamp: Date.now(),
    });
    logger.info(`Added notebook entry: "${text}". Total entries: ${this.entries.length}`);
  }
  
  /**
   * Get all notebook entries
   */
  getEntries(): NotebookEntry[] {
    return this.entries;
  }
  
  /**
   * Show notebook contents to player via chat
   */
  showToPlayer(playerEntity: PlayerEntity): void { // Use imported PlayerEntity type
    const player = playerEntity.player; // Get the associated Player object
    if (!player) {
        logger.warn(`Could not get Player object from PlayerEntity ${playerEntity.id}`);
        return;
    }

    const world = player.world;
    if (!world) {
        logger.warn(`Could not get World object from Player ${player.id}`);
        return;
    }

    if (this.entries.length === 0) {
      world.chatManager.sendPlayerMessage(player, "Your notebook is empty. Examine objects to collect clues.");
      return;
    }
    
    world.chatManager.sendPlayerMessage(player, "=== DETECTIVE'S NOTEBOOK ===");
    this.entries.forEach((entry, index) => {
      const date = new Date(entry.timestamp);
      const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      world.chatManager.sendPlayerMessage(player, `[${index + 1}] ${timeStr} - ${entry.text}`);
    });
    world.chatManager.sendPlayerMessage(player, "===========================");
    
    logger.info(`Displayed notebook with ${this.entries.length} entries to player ${player.id}`);
  }

  // --- Interactable Implementation ---

  public getInteractText(): string {
      return "Open Notebook [E]";
  }

  public interact(player: Player): void {
      if (!this._hytopiaEntity) {
            logger.error(`Cannot interact with NotebookEntity: Hytopia Entity not spawned or invalid.`);
            return;
      }
      const world = player.world ?? this._hytopiaEntity.world;
      const playerEntity = world?.entityManager.getPlayerEntitiesByPlayer(player)[0];

      if (playerEntity) {
          logger.info(`Player ${player.id} interacted with NotebookEntity ${this.id}.`);
          this.showToPlayer(playerEntity); // Pass PlayerEntity, no cast needed
      } else {
          logger.warn(`Could not find PlayerEntity for player ${player.id} during notebook interaction.`);
          world?.chatManager.sendPlayerMessage(player, "Error accessing notebook entity.", "FF0000");
      }
  }
  
  // Optional: Override despawn to handle the Hytopia entity
  public despawn(): void {
      if (this._hytopiaEntity) {
          logger.info(`Despawning Hytopia Entity ${this.id} for NotebookEntity.`);
          // If a specific despawn method exists for the entity, call it here.
          // Otherwise, the EntityManager likely handles removal.
          this._hytopiaEntity = null; // Clear reference
      }
      super.despawn?.();
  }
}

// Keep existing createNotebook function if needed elsewhere, ensures consistency
export function createNotebook(position: Vector3): NotebookEntity {
  return new NotebookEntity(position);
} 