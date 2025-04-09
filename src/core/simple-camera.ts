import { Player, PlayerCameraMode, PlayerEntity } from 'hytopia';
import { logger } from '../utils/logger';

/**
 * A very simple camera manager that uses the most basic camera setup possible
 */
export class SimpleCamera {
    /**
     * Set up a third person camera with extreme offset to ensure it's not inside the player
     */
    public static setupThirdPerson(player: Player, entity: PlayerEntity): void {
        try {
            // Set camera mode
            player.camera.setMode(PlayerCameraMode.THIRD_PERSON);
            
            // Set camera offset - very far back and high to ensure it's not inside the player
            player.camera.setOffset({ x: 0, y: 3.0, z: -12.0 });
            
            // Attach camera to entity
            player.camera.setAttachedToEntity(entity);
            
            // Enable mouse look
            this.forceEnableMouseLook(player);
            
            // Send message to player
            player.sendMessage('Camera mode: Third Person (Far View)');
            logger.info(`Third person camera set up for player ${player.id}`);
        } catch (error) {
            logger.error(`Failed to set up third person camera: ${error}`);
        }
    }
    
    /**
     * Set up a first person camera
     */
    public static setupFirstPerson(player: Player, entity: PlayerEntity): void {
        try {
            // Set camera mode
            player.camera.setMode(PlayerCameraMode.FIRST_PERSON);
            
            // Set camera offset - higher than default to ensure it's at eye level
            player.camera.setOffset({ x: 0, y: 1.7, z: 0 });
            
            // Set forward offset to push camera forward slightly
            player.camera.setForwardOffset(0.3);
            
            // Attach camera to entity
            player.camera.setAttachedToEntity(entity);
            
            // Enable mouse look
            this.forceEnableMouseLook(player);
            
            // Send message to player
            player.sendMessage('Camera mode: First Person');
            logger.info(`First person camera set up for player ${player.id}`);
        } catch (error) {
            logger.error(`Failed to set up first person camera: ${error}`);
        }
    }
    
    /**
     * Toggle between first and third person camera modes
     */
    public static toggleCameraMode(player: Player, entity: PlayerEntity): void {
        try {
            const currentMode = player.camera.mode;
            
            if (currentMode === PlayerCameraMode.FIRST_PERSON) {
                this.setupThirdPerson(player, entity);
            } else {
                this.setupFirstPerson(player, entity);
            }
        } catch (error) {
            logger.error(`Failed to toggle camera mode: ${error}`);
        }
    }
    
    /**
     * Force enable mouse look with multiple attempts
     */
    public static forceEnableMouseLook(player: Player): void {
        try {
            // First attempt
            player.ui.sendData({
                type: 'enable_mouse_look',
                enabled: true,
                sensitivity: 0.5,
                smoothing: 0.2
            });
            
            // Second attempt after delay
            setTimeout(() => {
                if (player) {
                    player.ui.sendData({
                        type: 'enable_mouse_look',
                        enabled: true,
                        sensitivity: 0.5,
                        smoothing: 0.2
                    });
                }
            }, 1000);
            
            // Third attempt after longer delay
            setTimeout(() => {
                if (player) {
                    player.ui.sendData({
                        type: 'enable_mouse_look',
                        enabled: true,
                        sensitivity: 0.5,
                        smoothing: 0.2
                    });
                }
            }, 3000);
            
            // Fourth attempt after even longer delay
            setTimeout(() => {
                if (player) {
                    player.ui.sendData({
                        type: 'enable_mouse_look',
                        enabled: true,
                        sensitivity: 0.5,
                        smoothing: 0.2
                    });
                    
                    // Also send camera tracking message
                    player.ui.sendData({
                        type: 'camera_tracking',
                        enabled: true,
                        target: 'player'
                    });
                }
            }, 5000);
            
            logger.info(`Mouse look enabled for player ${player.id}`);
        } catch (error) {
            logger.error(`Failed to enable mouse look: ${error}`);
        }
    }
}
