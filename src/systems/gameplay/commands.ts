import { World, Player, type PlayerEntity } from 'hytopia';
import { logger } from '../../utils/logger';
import { spawnModelSafely, spawnFurnitureAsBlock, createSafeModelEntity } from '../../utils/model-utils';

/**
 * Registers all custom chat commands for the server.
 * @param world The Hytopia World instance.
 */
export function registerCommands(world: World): void {
    logger.info('Registering custom chat commands...');

    registerModelfileCommand(world);
    registerRocketCommand(world);
    registerJumpCommand(world);
    registerSuperjumpCommand(world);
    registerSafemodelCommand(world);
    registerFurnitureCommand(world);

    // Example command (can be removed later)
    world.chatManager.registerCommand('hello', (player: Player, args: string[]) => {
        logger.info(`Command /hello received from player ${player.id} with args:`, args);
        world.chatManager.sendPlayerMessage(player, `Hello player ${player.id}, you said: ${args.join(' ')}`, 'FFFF00');
    });

    // Test command to check UI -> Server communication
    world.chatManager.registerCommand('test_ui_ping', (player: Player, _args: string[]) => {
        logger.info(`<<< Received /test_ui_ping command from UI (Player ${player.id}) >>>`);
        // Optionally send an acknowledgement back via chat
        // world.chatManager.sendPlayerMessage(player, 'Server received test ping!', '00FFFF');
    });

    logger.info('✅ Custom chat commands registered.');
}

/**
 * Gets the player's entity, sending a message if not found.
 * @param world The world instance.
 * @param player The player.
 * @returns The player's entity or null if not found.
 */
function getPlayerEntityOrMsg(world: World, player: Player): PlayerEntity | null {
    const playerEntities = world.entityManager.getPlayerEntitiesByPlayer(player);
    if (playerEntities.length === 0) {
        world.chatManager.sendPlayerMessage(player, 'Could not find your player entity!', 'FF0000');
        logger.warn(`Could not find entity for player ${player.id} requesting command.`);
        return null;
    }
    const entity = playerEntities[0];
    return entity ?? null;
}

/**
 * Registers the /modelfile command.
 * Usage: /modelfile [path] [scale]
 */
function registerModelfileCommand(world: World): void {
    world.chatManager.registerCommand('/modelfile', (player: Player, args: string[] = []) => {
        logger.info(`Player ${player.id} used /modelfile: ${args.join(' ')}`);
        const playerEntity = getPlayerEntityOrMsg(world, player);
        if (!playerEntity) return;

        const playerPos = playerEntity.position;
        const modelPath = args[0] ?? 'custom/desk_low_poly';
        const scale = parseFloat(args[1] ?? '1') || 1;

        // Spawn 3 units in front
        const facingDir = playerEntity.player?.camera?.facingDirection || { x: 0, y: 0, z: 1 };
        const spawnPos = {
            x: playerPos.x + facingDir.x * 3,
            y: playerPos.y,
            z: playerPos.z + facingDir.z * 3
        };

        try {
            spawnModelSafely(world, modelPath, spawnPos, scale);
            world.chatManager.sendPlayerMessage(player, `Spawned model "${modelPath}" (scale ${scale})`, '00FFFF');
        } catch (error) {
            logger.error(`Error in /modelfile for player ${player.id}:`, error);
            world.chatManager.sendPlayerMessage(player, `Error spawning model: ${String(error)}`, 'FF0000');
        }
    });
}

/**
 * Registers the /rocket command.
 */
function registerRocketCommand(world: World): void {
    world.chatManager.registerCommand('/rocket', (player: Player) => {
        logger.info(`Player ${player.id} used /rocket`);
        const playerEntity = getPlayerEntityOrMsg(world, player);
        if (!playerEntity) return;

        const rocketImpulse = { x: 0, y: 22.5, z: 0 }; // Reduced impulse
        logger.debug(`Applying rocket impulse to ${player.id}: ${JSON.stringify(rocketImpulse)}`);
        playerEntity.applyImpulse(rocketImpulse);
        world.chatManager.sendPlayerMessage(player, '🚀 BLAST OFF! 🚀', 'FFA500');
    });
}

/**
 * Registers the /jump command.
 * Usage: /jump (uses fixed power)
 */
function registerJumpCommand(world: World): void {
    world.chatManager.registerCommand('/jump', (player: Player) => {
        logger.info(`Player ${player.id} used /jump`);
        const playerEntity = getPlayerEntityOrMsg(world, player);
        if (!playerEntity) return;

        const jumpPower = 16.875; // Reduced power
        const jumpImpulse = { x: 0, y: playerEntity.mass * jumpPower, z: 0 };
        logger.debug(`Applying jump impulse to ${player.id}: ${JSON.stringify(jumpImpulse)}`);
        playerEntity.applyImpulse(jumpImpulse);
        world.chatManager.sendPlayerMessage(player, `Jumped with power: ${jumpPower}`, '00FFFF');
    });
}

/**
 * Registers the /superjump command.
 */
function registerSuperjumpCommand(world: World): void {
    world.chatManager.registerCommand('/superjump', (player: Player) => {
        logger.info(`Player ${player.id} used /superjump`);
        const playerEntity = getPlayerEntityOrMsg(world, player);
        if (!playerEntity) return;

        const jumpPower = 56.25; // Reduced power
        const jumpImpulse = { x: 0, y: playerEntity.mass * jumpPower, z: 0 };
        logger.debug(`Applying super jump impulse to ${player.id}: ${JSON.stringify(jumpImpulse)}`);
        playerEntity.applyImpulse(jumpImpulse);
        world.chatManager.sendPlayerMessage(player, 'SUPER JUMP! To the moon!', 'FF0000');
    });
}

/**
 * Registers the /safemodel command (now uses block-based spawning).
 * Usage: /safemodel [type] [scale]
 */
function registerSafemodelCommand(world: World): void {
    world.chatManager.registerCommand('/safemodel', (player: Player, args: string[] = []) => {
        logger.info(`Player ${player.id} used /safemodel: ${args.join(' ')}`);
        const playerEntity = getPlayerEntityOrMsg(world, player);
        if (!playerEntity) return;

        const playerPos = playerEntity.position;
        const modelType = args[0] ?? 'desk';
        const scale = parseFloat(args[1] ?? '1') || 1;

        // Spawn 3 units in front
        const facingDir = playerEntity.player?.camera?.facingDirection || { x: 0, y: 0, z: 1 };
        const spawnPos = {
            x: playerPos.x + facingDir.x * 3,
            y: playerPos.y,
            z: playerPos.z + facingDir.z * 3
        };

        try {
            // Use the block-based function now
            spawnFurnitureAsBlock(world, modelType, spawnPos, scale);
            world.chatManager.sendPlayerMessage(player, `Created safe model (block) "${modelType}" (scale ${scale})`, '00FFFF');
        } catch (error) {
            logger.error(`Error in /safemodel for player ${player.id}:`, error);
            world.chatManager.sendPlayerMessage(player, `Error creating safe model: ${String(error)}`, 'FF0000');
        }
    });
}

/**
 * Registers the /furniture command (uses block-based spawning).
 * Usage: /furniture [type] [scale] [color]
 */
function registerFurnitureCommand(world: World): void {
    world.chatManager.registerCommand('/furniture', (player: Player, args: string[] = []) => {
        logger.info(`Player ${player.id} used /furniture: ${args.join(' ')}`);

        if (args[0] === 'help' || args[0] === '?') {
            sendFurnitureHelp(player, world);
            return;
        }

        const playerEntity = getPlayerEntityOrMsg(world, player);
        if (!playerEntity) return;

        const playerPos = playerEntity.position;
        const type = args[0] ?? 'desk';
        const scale = parseFloat(args[1] ?? '1') || 1;
        const color = args[2] ?? 'FFFFFF';

        // Spawn 3 units in front
        const facingDir = playerEntity.player?.camera?.facingDirection || { x: 0, y: 0, z: 1 };
        const spawnPos = {
            x: playerPos.x + facingDir.x * 3,
            y: playerPos.y,
            z: playerPos.z + facingDir.z * 3
        };

        try {
            spawnFurnitureAsBlock(world, type, spawnPos, scale, color);
            world.chatManager.sendPlayerMessage(player, `Spawned ${type} furniture block (scale ${scale})`, '00FFFF');
        } catch (error) {
            logger.error(`Error in /furniture for player ${player.id}:`, error);
            world.chatManager.sendPlayerMessage(player, `Error spawning furniture: ${String(error)}`, 'FF0000');
        }
    });
}

/**
 * Sends help text for the /furniture command.
 */
function sendFurnitureHelp(player: Player, world: World): void {
    world.chatManager.sendPlayerMessage(player, `Furniture Command Help:`, 'FFFF00');
    world.chatManager.sendPlayerMessage(player, `/furniture [type] [scale] [color]`, 'FFFFFF');
    world.chatManager.sendPlayerMessage(player, `Types: desk, table, chair, bed, bookshelf, cabinet`, 'FFFFFF');
    world.chatManager.sendPlayerMessage(player, `Scale: Number (default: 1)`, 'FFFFFF');
    world.chatManager.sendPlayerMessage(player, `Colors: red, green, blue, yellow, black, or hex (FFFFFF)`, 'FFFFFF');
    world.chatManager.sendPlayerMessage(player, `Example: /furniture bookshelf 1.2 blue`, 'FFFFFF');
} 