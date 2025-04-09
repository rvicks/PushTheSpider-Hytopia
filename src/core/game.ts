import { World, startServer, PlayerEvent, Audio, type Player, PlayerCameraMode, PlayerEntityController } from 'hytopia';
import { logger } from '../utils/logger';
import { BAKER_STREET_MAP, PLAYER_SPAWN, DEFAULT_PLAYER_MODEL } from './config';
import { PlayerEntity } from '../entities/base/player-entity';
// REMOVED: import { SherlockPlayerController } from '../entities/controllers/sherlock-controller';
import { registerCommands } from '../systems/gameplay/commands';
import { createBakerStreetMap, createNotebookAndClue, notebookPosition, cluePosition } from './world';
// REMOVED: import { handleExamineObject } from '../entities/controllers/sherlock-controller'; // This function was in the deleted controller

// Global world reference
let worldInstance: World;
const playerEntities = new Map<string, PlayerEntity>();
let totalConnections = 0; // Non-const tracking

// Store clues discovered by each player
const playerClues: Record<string, string[]> = {};

/**
 * Initializes the game world, sets up event listeners, and loads initial resources.
 * @param world The Hytopia World instance.
 */
export function initializeGame(world: World): void {
    logger.info('[Game] initializeGame function entered.');
    worldInstance = world;
    logger.info('=== S.I.N. SERVER INITIALIZING ===');
    logger.info(`Server started at: ${new Date().toISOString()}`);

    // Attempt to disable model optimization (redundant but safe)
    disableModelOptimization(world);

    // Enable physics debug rendering if needed (move to config?)
    // world.simulation.enableDebugRendering(true);

    // Create the initial map
    try {
        logger.info('Creating Baker Street map...');
        createBakerStreetMap(world);
        createNotebookAndClue(world);
        logger.info('✅ Baker Street map created successfully');
    } catch (error) {
        logger.error('Failed to create Baker Street map!', error);
        // Load a fallback empty map instead of crashing
        try {
            logger.info('Attempting to create a fallback empty map...');
            // Create a simple flat terrain or load another map as fallback
            world.loadMap({
                blocks: {}, // Empty blocks object
                entities: {}  // Empty entities object
            });
            logger.info('✅ Fallback empty map created successfully');
        } catch (fallbackError) {
            logger.error('Failed to create fallback map!', fallbackError);
            logger.warn('Server will continue but players may see an empty world');
        }
    }

    // Register custom commands
    registerCommands(world);

    // Set up player event listeners
    setupPlayerEventListeners(world);

    logger.info('=== S.I.N. SERVER READY ===');
}

/**
 * Attempts to disable Hytopia's model optimization.
 * @param world The Hytopia World instance.
 */
function disableModelOptimization(world: World): void {
    try {
        const hytopiaGlobal = (globalThis as any).Hytopia;
        if (hytopiaGlobal?.ModelRegistry?.instance) {
            hytopiaGlobal.ModelRegistry.instance.optimize = false;
            logger.info('ModelRegistry optimization disabled via global Hytopia.ModelRegistry');
        } else {
             logger.warn('Could not find global Hytopia.ModelRegistry to disable optimization.');
        }
        // Additional checks on world object if necessary
    } catch (error) {
        logger.warn('Failed attempt to disable model optimization', error);
    }
}

/**
 * Sets up listeners for player join and leave events.
 * @param world The Hytopia World instance.
 */
function setupPlayerEventListeners(world: World): void {
    // Clean up any existing listeners first
    try {
        // Remove our specific listeners if they exist
        // Note: The correct way to remove event listeners may vary based on Hytopia's implementation
        // Try this more generic approach
        const joinHandler = ({ player }: { player: Player }) => {
            totalConnections++;
            logger.info(`Player joined: ${player.id} (Total connections: ${totalConnections})`);
            handlePlayerJoin(world, player);
        };

        const leaveHandler = ({ player }: { player: Player }) => {
            logger.info(`Player left: ${player.id}`);
            handlePlayerLeave(world, player);
        };

        logger.info('Set up new player event listeners');

        // Set up event handlers
        world.on(PlayerEvent.JOINED_WORLD, joinHandler);
        world.on(PlayerEvent.LEFT_WORLD, leaveHandler);
    } catch (error) {
        logger.warn('Error setting up player event listeners', error);
    }

    logger.info("Player event listeners setup complete");
}

/**
 * Handles the logic when a player joins the world.
 * @param world The Hytopia World instance.
 * @param player The joining Player instance.
 */
function handlePlayerJoin(world: World, player: Player): void {
    try {
        // First clean up any existing entities for this player ID (just in case)
        const existingEntities = world.entityManager.getPlayerEntitiesByPlayer(player);
        if (existingEntities.length > 0) {
            logger.warn(`Found ${existingEntities.length} existing entities for player ${player.id}, cleaning up...`);
            existingEntities.forEach(entity => entity.despawn());
        }

        // Explicitly use the default controller
        const defaultController = new PlayerEntityController();

        // Create a new player entity with default settings
        const playerEntity = new PlayerEntity({
            player,
            name: `Sherlock-${player.id}`,
            modelUri: DEFAULT_PLAYER_MODEL, // Reverted back to custom model
            modelScale: 1, // Default scale
            controller: defaultController // Assign the default controller instance
        });

        playerEntities.set(player.id, playerEntity);

        logger.info(`Attempting to spawn player entity for ${player.id} at ${JSON.stringify(PLAYER_SPAWN)}`);

        // Spawn the player entity
        playerEntity.spawn(world, PLAYER_SPAWN);
        
        // --- Camera and Position Adjustment ---
        // Use setTimeout to ensure rigid body exists and position can be set after initial spawn physics settle slightly
        setTimeout(() => {
            const rigidBody = playerEntity.rawRigidBody;
            if (rigidBody && playerEntity.isSpawned) { // Double check entity is still valid
                try {
                    // const teleportPos = { ...PLAYER_SPAWN, y: PLAYER_SPAWN.y + 0.1 }; // Spawn slightly above configured Y
                    // logger.info(`Adjusting player ${player.id} position post-spawn to ${JSON.stringify(teleportPos)}`);
                    // rigidBody.position = teleportPos; // Use position assignment instead - REVERTED, causing issues

                    // Set camera mode AFTER spawn physics settle
                    logger.info(`Setting camera mode to THIRD_PERSON for player ${player.id} after delay`);
                    player.camera.setMode(PlayerCameraMode.THIRD_PERSON);
                    logger.info(`Camera mode set.`);
                } catch (adjustError) {
                     logger.error(`Error during post-spawn adjustment or camera reset for player ${player.id}:`, adjustError);
                }
            } else {
                logger.warn(`Could not get rigidBody or entity not spawned for post-spawn adjustment for player ${player.id}`);
                // Fallback: try setting camera mode anyway
                try {
                    logger.info(`Setting initial camera mode to THIRD_PERSON for player ${player.id} (fallback)`);
                    player.camera.setMode(PlayerCameraMode.THIRD_PERSON);
                } catch (cameraError) {
                     logger.error(`Error setting fallback camera mode for player ${player.id}:`, cameraError);
                }
            }
        }, 100); // Delay 100ms
        // -------------------------------------
        
        // Load player UI
        logger.info(`Loading UI for player ${player.id}`);
        try {
             // Use the original UI file that's known to work
             player.ui.load('ui/index.html');
             logger.info(`✅ UI loaded for player ${player.id}`);

             // Initialize the UI with empty notebook entries
             player.ui.sendData({
                 type: 'update_notebook',
                 entries: []
             });
        } catch (uiError) {
             logger.error(`Failed to load UI for player ${player.id}:`, uiError);
        }

        // Send welcome messages
        world.chatManager.sendPlayerMessage(player, 'Welcome to S.I.N., Sherlock!', '00FF00');
        world.chatManager.sendPlayerMessage(player, 'Use WASD to move and Space to jump.', '00FF00');
        world.chatManager.sendPlayerMessage(player, 'Find the emerald block (notebook) and lava block (clue) in the world.', '00FF00');
        world.chatManager.sendPlayerMessage(player, 'Look at these blocks and press E to interact with them.', '00FF00');

        // ADDED: Log final position
        logger.info(`Player ${player.id} entity ${playerEntity.id} final position: ${JSON.stringify(playerEntity.position)}`);

    } catch (error) {
        // RESTORED: Error handling and message sending
        logger.error(`Error handling player join for ${player.id}:`, error);
        // Try to recover by sending an error message to the player
        try {
            world.chatManager.sendPlayerMessage(player, 'Error loading your character. Please reconnect.', 'FF0000');
        } catch (messageError) {
            logger.error(`Failed to send error message to player ${player.id}:`, messageError);
        }
    }
}

/**
 * Handles the logic when a player leaves the world.
 * @param world The Hytopia World instance.
 * @param player The leaving Player instance.
 */
function handlePlayerLeave(world: World, player: Player): void {
    try {
        // Clean up player entities
        const entities = world.entityManager.getPlayerEntitiesByPlayer(player);
        logger.info(`Cleaning up ${entities.length} entities for player ${player.id}`);

        entities.forEach(entity => {
            try {
                entity.despawn();
                logger.info(`Successfully despawned entity ${entity.id} for player ${player.id}`);
            } catch (despawnError) {
                logger.error(`Error despawning entity ${entity.id} for player ${player.id}:`, despawnError);
            }
        });

        // Remove from our tracking
        playerEntities.delete(player.id);

        logger.info(`Player ${player.id} cleanup complete`);
    } catch (error) {
        logger.error(`Error handling player leave for ${player.id}:`, error);
    }
}

/**
 * Plays ambient music in the game world.
 * @param world The Hytopia World instance.
 */
function playAmbientMusic(world: World): void {
    try {
        logger.info('Attempting to play ambient music...');
        const music = new Audio({
            uri: 'audio/music/hytopia-main.mp3',
            loop: true,
            volume: 0.1, // Keep volume low initially
        });
        music.play(world);
        logger.info('✅ Ambient music started.'); // Log success
    } catch (error) {
        logger.error('❌ Failed to play ambient music:', error);
    }
}

/**
 * Plays ambient fireplace sound in the game world.
 * TODO: Need fireplace position logic here or passed in.
 * @param world The Hytopia World instance.
 */
function playFireplaceSound(world: World): void {
    // TODO: Determine correct fireplace position dynamically or from config
    const fireplacePosition = { x: 10.5, y: 1 + 1.5, z: 1.5 }; // Hardcoded based on world.ts for now
    try {
        logger.info(`Attempting to play fireplace sound at ${JSON.stringify(fireplacePosition)}...`);
         const sound = new Audio({
            uri: 'audio/sfx/fire/fire-burning.mp3',
            loop: true,
            volume: 0.4,
            position: fireplacePosition
        });
        sound.play(world);
        logger.info("✅ Fireplace ambient sound started.");
    } catch (soundError) {
        logger.error("❌ Failed to play fireplace sound:", soundError);
    }
}

// Correcting the export function signature again
/* // REMOVED: handleExamineObject was part of the deleted controller
export function handleExamineObject(playerEntity: PlayerEntity, position: { x: number, y: number, z: number }) {
    const player = playerEntity.player;
    if (!player) {
        logger.error("handleExamineObject: PlayerEntity has no associated player!");
        return;
    }
    // Use player.world.chatManager.sendPlayerMessage for sending messages
    const world = player.world;
    if (!world) {
        logger.error("handleExamineObject: Player has no associated world!");
        return;
    }
    const chat = world.chatManager;
    
    // Check if this is the clue position
    if (Math.floor(position.x) === cluePosition.x && 
        Math.floor(position.y) === cluePosition.y && 
        Math.floor(position.z) === cluePosition.z) {
        
        const clueText = "You found a mysterious clue! It appears to be important.";
        chat.sendPlayerMessage(player, clueText);
        
        const playerId = player.id.toString();
        if (!playerClues[playerId]) {
            playerClues[playerId] = [];
        }
        
        if (!playerClues[playerId].includes(clueText)) {
            playerClues[playerId].push(clueText);
            chat.sendPlayerMessage(player, "This clue has been added to your notebook!");
        }
    }
    
    // Check if this is the notebook position
    if (Math.floor(position.x) === notebookPosition.x && 
        Math.floor(position.y) === notebookPosition.y && 
        Math.floor(position.z) === notebookPosition.z) {
        
        chat.sendPlayerMessage(player, "=== DETECTIVE'S NOTEBOOK ===");
        
        const playerId = player.id.toString();
        if (!playerClues[playerId] || playerClues[playerId].length === 0) {
            chat.sendPlayerMessage(player, "Your notebook is empty. Find clues by examining objects.");
        } else {
            playerClues[playerId].forEach((clue, index) => {
                chat.sendPlayerMessage(player, `[${index + 1}] ${clue}`);
            });
        }
        
        chat.sendPlayerMessage(player, "===========================");
    }
}
*/