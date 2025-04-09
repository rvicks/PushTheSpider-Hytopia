// Base Entity Wrapper (Optional)
// For now, we can just re-export the Hytopia Entity or create a thin wrapper if needed later.

import { Entity as HytopiaEntity, type EntityOptions, type World, type Vector3Like } from 'hytopia';
import { logger } from '../../utils/logger';

/**
 * Base class for custom entity wrappers.
 * Holds a reference to the underlying Hytopia entity.
 */
export abstract class Entity {
    // Property to hold the Hytopia entity instance
    protected _hytopiaEntity: HytopiaEntity | null = null;

    // Abstract ID property subclasses must implement - Changed type to number
    public abstract readonly id: number;

    constructor() {
        logger.debug('Custom Base Entity constructor called.');
    }

    /**
     * Gets the underlying Hytopia entity.
     */
    public get hytopiaEntity(): HytopiaEntity | null {
        return this._hytopiaEntity;
    }

    // Add common methods needed by subclasses, e.g., spawn/despawn wrappers
    // These might need to be abstract if implementation varies significantly
    public spawn(world: World, position: Vector3Like): void {
        if (this._hytopiaEntity) {
            // Position should ideally be set during entity creation or via teleport/setPosition
            logger.info(`Spawning entity ${this.id} (Position was set during creation or needs separate call)`);
            // REMOVE direct position assignment: this._hytopiaEntity.position = position;
            // FIX: Use spawnEntity method (assuming it exists)
            world.entityManager.spawnEntity(this._hytopiaEntity);
        } else {
            logger.error('Attempted to spawn entity wrapper with no underlying Hytopia entity.');
        }
    }

    public despawn(): void {
        if (this._hytopiaEntity) {
            logger.info(`Despawning entity ${this.id}`);
            this._hytopiaEntity.despawn(); // Use Hytopia entity's despawn
            this._hytopiaEntity = null; // Clear reference
        } else {
            logger.warn('Attempted to despawn entity wrapper with no underlying Hytopia entity or already despawned.');
        }
    }

    // Expose common properties if needed
    public get position(): Vector3Like | undefined {
        return this._hytopiaEntity?.position;
    }

}

// Keep the re-export if needed elsewhere, but our classes will extend the wrapper now.
// export { HytopiaEntity };

// Example of a potential future wrapper if customization is needed:
/*
export class Entity extends HytopiaEntity {
    constructor(options: EntityOptions) {
        super(options);
        logger.debug(`Custom Entity class instantiated: ${options.name || 'Unnamed'}`);
    }

    // Add custom methods or override existing ones here
    public customMethod(): void {
        logger.info(`Custom method called on entity ${this.id}`);
    }
}
*/ 