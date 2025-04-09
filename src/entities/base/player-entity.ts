import {
    PlayerEntity as HytopiaPlayerEntity,
    type PlayerEntityOptions as HytopiaPlayerEntityOptions,
    type Entity,
    type Player
} from 'hytopia';
import { logger } from '../../utils/logger';

// Extend HytopiaPlayerEntityOptions if needed, otherwise just use it
export type PlayerEntityOptions = HytopiaPlayerEntityOptions;

/**
 * Wrapper class for Hytopia's PlayerEntity.
 * Provides a place for custom player-specific logic and properties if needed.
 */
export class PlayerEntity extends HytopiaPlayerEntity {
    constructor(options: PlayerEntityOptions) {
        super(options);
        logger.debug(`Custom PlayerEntity class instantiated for player: ${options.player.id}`);
    }

    // Example: Add a custom method specific to players
    public sayHello(): void {
        if (this.world && this.player) {
            const message = `Hello from PlayerEntity ${this.id} (Player ${this.player.id})!`;
            this.world.chatManager.sendPlayerMessage(this.player, message, '00FF00');
            logger.info(message);
        }
    }

    /**
     * Override spawn to add custom logging or behavior.
     * @param world The world to spawn in.
     * @param position The position to spawn at.
     */
    public spawn(world: any, position: any): void {
        logger.info(`Spawning PlayerEntity ${this.id} for player ${this.player.id}...`);
        super.spawn(world, position);
        // Add any post-spawn logic here
        logger.info(`✅ PlayerEntity ${this.id} spawned successfully.`);
    }

    /**
     * Override despawn to add custom logging or behavior.
     */
    public despawn(): void {
        logger.info(`Despawning PlayerEntity ${this.id} for player ${this.player.id}...`);
        super.despawn();
        // Add any post-despawn cleanup here
        logger.info(`✅ PlayerEntity ${this.id} despawned successfully.`);
    }
} 