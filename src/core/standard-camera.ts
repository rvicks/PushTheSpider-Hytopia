import { Player, Entity, PlayerCameraMode } from 'hytopia';
import { logger } from '../utils/logger';

/**
 * BasicCamera - A minimal camera implementation using only essential Hytopia camera controls
 */
export class StandardCamera {
    /**
     * Set up a third-person camera for a player using the most basic settings
     * @param player The player to set up the camera for
     * @param entity The entity to track with the camera
     */
    static setupThirdPerson(player: Player, entity: Entity): void {
        try {
            // Just set the camera mode to third-person - this is the most basic approach
            player.setCameraMode(PlayerCameraMode.ThirdPerson);

            // Log success
            logger.info(`Basic third-person camera set up for player ${player.id}`);
        } catch (error) {
            logger.error(`Failed to set up third-person camera:`, error);
        }
    }

    /**
     * Set up a first-person camera for a player using the most basic settings
     * @param player The player to set up the camera for
     * @param entity The entity to track with the camera
     */
    static setupFirstPerson(player: Player, entity: Entity): void {
        try {
            // Just set the camera mode to first-person - this is the most basic approach
            player.setCameraMode(PlayerCameraMode.FirstPerson);

            // Log success
            logger.info(`Basic first-person camera set up for player ${player.id}`);
        } catch (error) {
            logger.error(`Failed to set up first-person camera:`, error);
        }
    }

    /**
     * Toggle between first-person and third-person camera modes
     * @param player The player to toggle camera mode for
     * @param entity The entity to track with the camera
     */
    static toggleCameraMode(player: Player, entity: Entity): void {
        try {
            // Get current camera mode
            const currentMode = player.getCameraMode();

            // Toggle camera mode
            if (currentMode === PlayerCameraMode.ThirdPerson) {
                this.setupFirstPerson(player, entity);
                logger.info(`Camera mode changed to first-person for player ${player.id}`);
            } else {
                this.setupThirdPerson(player, entity);
                logger.info(`Camera mode changed to third-person for player ${player.id}`);
            }
        } catch (error) {
            logger.error(`Failed to toggle camera mode:`, error);
        }
    }

    /**
     * Enable mouse look for a player - this is a no-op in the basic implementation
     * as mouse look should be enabled by default
     * @param player The player to enable mouse look for
     */
    static enableMouseLook(player: Player): void {
        // No implementation needed - mouse look should be enabled by default
        logger.info(`Mouse look should be enabled by default for player ${player.id}`);
    }
}
