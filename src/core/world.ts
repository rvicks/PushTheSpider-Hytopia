import { World, PlayerEntity, type Vector3Like, BlockType, Entity, CollisionGroup, ColliderShape, RigidBodyType, Vector3, Audio } from 'hytopia';
import { logger } from '../utils/logger';
import { PLAYER_SPAWN } from './config';
import { createSafeModelEntity, spawnFurnitureAsBlock } from '../utils/model-utils';
import { NotebookEntity } from '../entities/objects/notebook';
import { ClueEntity } from '../entities/objects/clue';

// Placeholder position for Holmes's Desk (adjust as needed relative to spawn)
const placeholderDeskPosition: Vector3Like = { x: PLAYER_SPAWN.x + 5, y: PLAYER_SPAWN.y, z: PLAYER_SPAWN.z };

// Placeholder position for Fireplace (adjust as needed relative to spawn)
const placeholderFireplacePosition: Vector3Like = { x: PLAYER_SPAWN.x -1, y: PLAYER_SPAWN.y, z: PLAYER_SPAWN.z + 2};

// Add these somewhere in the file
export const notebookPosition = { x: 5, y: 1, z: 5 };
export const cluePosition = { x: 7, y: 1, z: 5 };

/**
 * Creates the Baker Street map layout using blocks and spawns initial entities.
 * @param world The Hytopia World instance.
 */
export async function createBakerStreetMap(world: World): Promise<void> {
    logger.info('✅ Baker Street map creation initiated.');

    // Define room dimensions
    const roomWidth = 20;
    const roomDepth = 20;
    const roomHeight = 6; // Increased height from 4 to 6
    const floorY = 0;

    // Calculate boundaries
    const startX = -Math.floor(roomWidth / 2);
    const endX = startX + roomWidth;
    const startZ = -Math.floor(roomDepth / 2);
    const endZ = startZ + roomDepth;

    // --- Enhanced Textures ---
    const floorTexture = "blocks/oak-planks.png"; // Wooden floor for Victorian style
    const wallTexture = "blocks/dirty_bricks.png"; // Weathered brick for period feel
    const ceilingTexture = "blocks/stone.png"; 
    const deskTexture = "blocks/oak-planks.png"; // Wooden desk
    const fireplaceTexture = "blocks/brick.png";
    const rugTexture = "blocks/red-sand.png"; // As a Victorian-style carpet

    // --- Room Element Definitions ---
    // Window position (on negative Z wall)
    const windowPositionX = 4; 
    const windowWidth = 3;
    const windowHeight = 2;
    const windowY = floorY + 2;

    // Door position (on positive Z wall)
    const doorPositionX = roomWidth - 5;
    const doorWidth = 2;
    const doorHeight = 3;
    const doorY = floorY + 1;

    // Rug dimensions and position - centered in the room
    const rugWidth = 8;
    const rugDepth = 6;
    const rugX = Math.floor(roomWidth / 2) - Math.floor(rugWidth / 2);
    const rugZ = Math.floor(roomDepth / 2) - Math.floor(rugDepth / 2);

    try {
        // --- Floor ---
        logger.info(`Creating floor at Y=${floorY} with texture ${floorTexture}`);
        const floorHalfExtents = new Vector3(0.5, 0.5, 0.5);
        for (let x = 0; x < roomWidth; x++) {
            for (let z = 0; z < roomDepth; z++) {
                const position = new Vector3(x + 0.5, floorY + 0.5, z + 0.5);
                const floorOptions = {
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: floorTexture,
                    blockHalfExtents: floorHalfExtents,
                };

                const floorBlock = new Entity(floorOptions);
                await floorBlock.spawn(world, position);
            }
        }

        // --- Walls ---
        logger.info(`Creating walls with texture ${wallTexture}`);
        const wallHalfExtents = new Vector3(0.5, 0.5, 0.5);
        
        // Wall 1 (Positive Z)
        for (let x = 0; x < roomWidth; x++) {
            for (let y = floorY + 1; y <= floorY + roomHeight; y++) {
                // Skip door area
                if (x >= doorPositionX && x < doorPositionX + doorWidth && 
                    y >= doorY && y < doorY + doorHeight) {
                    continue;
                }
                
                const position = new Vector3(x + 0.5, y + 0.5, roomDepth - 0.5);
                const wallBlock = new Entity({
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: wallTexture,
                    blockHalfExtents: wallHalfExtents,
                });
                await wallBlock.spawn(world, position);
            }
        }
        
        // Wall 2 (Negative Z - with window)
        for (let x = 0; x < roomWidth; x++) {
            for (let y = floorY + 1; y <= floorY + roomHeight; y++) {
                // Skip window area
                if (x >= windowPositionX && x < windowPositionX + windowWidth && 
                    y >= windowY && y < windowY + windowHeight) {
                    // Add window frame (different texture)
                    if ((x === windowPositionX || x === windowPositionX + windowWidth - 1) ||
                        (y === windowY || y === windowY + windowHeight - 1)) {
                        const position = new Vector3(x + 0.5, y + 0.5, -0.5);
                        const frameBlock = new Entity({
                            rigidBodyOptions: { type: RigidBodyType.FIXED },
                            blockTextureUri: "blocks/oak-planks.png", // Wooden window frame
                            blockHalfExtents: wallHalfExtents,
                        });
                        await frameBlock.spawn(world, position);
                    }
                    // Skip the middle parts of the window
                    continue;
                }
                
                const position = new Vector3(x + 0.5, y + 0.5, -0.5);
                const wallBlock = new Entity({
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: wallTexture,
                    blockHalfExtents: wallHalfExtents,
                });
                await wallBlock.spawn(world, position);
            }
        }
        
        // Wall 3 (Positive X)
        for (let z = 0; z < roomDepth; z++) {
            for (let y = floorY + 1; y <= floorY + roomHeight; y++) {
                const position = new Vector3(roomWidth - 0.5, y + 0.5, z + 0.5);
                const wallBlock = new Entity({
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: wallTexture,
                    blockHalfExtents: wallHalfExtents,
                });
                await wallBlock.spawn(world, position);
            }
        }
        
        // Wall 4 (Negative X)
        for (let z = 0; z < roomDepth; z++) {
            for (let y = floorY + 1; y <= floorY + roomHeight; y++) {
                const position = new Vector3(-0.5, y + 0.5, z + 0.5);
                const wallBlock = new Entity({
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: wallTexture,
                    blockHalfExtents: wallHalfExtents,
                });
                await wallBlock.spawn(world, position);
            }
        }

        // --- Ceiling ---
        logger.info(`Creating ceiling at Y=${floorY + roomHeight} with texture ${ceilingTexture}`);
        const ceilingHalfExtents = new Vector3(0.5, 0.5, 0.5);
        for (let i = startX; i < endX; i++) {
            for (let j = startZ; j < endZ; j++) {
                const position = new Vector3(i + 0.5, floorY + roomHeight, j + 0.5);
                const ceilingBlock = new Entity({
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: ceilingTexture,
                    blockHalfExtents: ceilingHalfExtents,
                });
                await ceilingBlock.spawn(world, position);
            }
        }

        // --- Victorian Rug ---
        logger.info(`Creating Victorian rug with texture ${rugTexture}`);
        for (let x = rugX; x < rugX + rugWidth; x++) {
            for (let z = rugZ; z < rugZ + rugDepth; z++) {
                // Place rug slightly above floor to avoid z-fighting
                const position = new Vector3(x + 0.5, floorY + 0.51, z + 0.5);
                const rugBlock = new Entity({
                    name: "Rug",
                    rigidBodyOptions: { type: RigidBodyType.FIXED },
                    blockTextureUri: rugTexture,
                    blockHalfExtents: new Vector3(0.5, 0.02, 0.5), // Thin to look like a rug
                });
                await rugBlock.spawn(world, position);
            }
        }

        // --- Placeholder Furniture ---

        // Desk Placeholder - more furniture-like dimensions
        const deskPosition = new Vector3(6.0, floorY + 1.1, 6.0);
        const deskHalfExtents = new Vector3(1, 0.5, 0.7); // Wider, more desk-like
        logger.info(`Spawning Desk placeholder at ${deskPosition.toString()}`);
        const deskEntity = new Entity({
            name: "Desk",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: deskTexture,
            blockHalfExtents: deskHalfExtents,
        });
        await deskEntity.spawn(world, new Vector3(deskPosition.x, deskPosition.y + deskHalfExtents.y, deskPosition.z));
        logger.info("✅ Desk placeholder spawned successfully.");

        // Chair Placeholder - behind desk
        const chairPosition = new Vector3(6.0, floorY + 0.7, 7.5);
        const chairHalfExtents = new Vector3(0.5, 0.5, 0.5);
        logger.info(`Spawning Chair placeholder at ${chairPosition.toString()}`);
        const chairEntity = new Entity({
            name: "Chair",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/oak-planks.png", // Wooden chair
            blockHalfExtents: chairHalfExtents,
        });
        await chairEntity.spawn(world, new Vector3(chairPosition.x, chairPosition.y + chairHalfExtents.y, chairPosition.z));
        logger.info("✅ Chair placeholder spawned successfully.");

        // Fireplace Placeholder - enhanced with multiple blocks
        const fireplacePosition = new Vector3(10.5, floorY + 1, 1.5); // Against wall
        const fireplaceHalfExtents = new Vector3(1.5, 1.5, 0.5); // Wider fireplace
        logger.info(`Spawning Fireplace placeholder at ${fireplacePosition.toString()}`);
        
        // Main fireplace block
        const fireplaceEntity = new Entity({
            name: "Fireplace",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: fireplaceTexture,
            blockHalfExtents: fireplaceHalfExtents,
        });
        await fireplaceEntity.spawn(world, new Vector3(fireplacePosition.x, fireplacePosition.y + fireplaceHalfExtents.y, fireplacePosition.z));
        
        // Add fireplace mantel (top block with different texture)
        const mantelPosition = new Vector3(fireplacePosition.x, fireplacePosition.y + fireplaceHalfExtents.y*2 + 0.1, fireplacePosition.z);
        const mantelHalfExtents = new Vector3(1.7, 0.2, 0.6); // Wider than fireplace
        const mantelEntity = new Entity({
            name: "Fireplace Mantel",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/oak-planks.png", // Wooden mantel
            blockHalfExtents: mantelHalfExtents,
        });
        await mantelEntity.spawn(world, mantelPosition);
        
        // Add fire glow (inner block with lava texture)
        const glowPosition = new Vector3(fireplacePosition.x, fireplacePosition.y + 0.7, fireplacePosition.z + 0.2);
        const glowHalfExtents = new Vector3(1, 0.7, 0.1); // Smaller than main fireplace
        const glowEntity = new Entity({
            name: "Fireplace Glow",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/lava.png", // Fire glow
            blockHalfExtents: glowHalfExtents,
        });
        await glowEntity.spawn(world, glowPosition);
        
        logger.info("✅ Enhanced Fireplace placeholder spawned.");

        // Bookshelf Placeholder - enhanced with multiple shelf levels
        const bookshelfPosition = new Vector3(3, floorY + 1, 0.5); // Against back wall
        const bookshelfHalfExtents = new Vector3(1.5, 2, 0.5); // Size: 3 wide, 4 high, 1 deep
        const bookshelfTexture = "blocks/oak-planks.png";
        logger.info(`Spawning Bookshelf placeholder at ${bookshelfPosition.toString()}`);
        
        // Main bookshelf structure
        const bookshelfEntity = new Entity({
            name: "Bookshelf",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: bookshelfTexture,
            blockHalfExtents: bookshelfHalfExtents,
        });
        await bookshelfEntity.spawn(world, new Vector3(bookshelfPosition.x, bookshelfPosition.y + bookshelfHalfExtents.y, bookshelfPosition.z));
        
        // Add books appearance (multiple colored blocks as shelves)
        const shelfColors = [
            "blocks/stone.png",         // Placeholder for Green books
            "blocks/red-sand.png",      // Red books
            "blocks/stone.png",         // Dark books - built-in texture 
            "blocks/sand.png"           // Yellow books - built-in texture
        ];
        
        // Create books on each shelf level
        for (let i = 0; i < 4; i++) {
            const shelfY = bookshelfPosition.y + 0.5 + i;
            const shelfZ = bookshelfPosition.z + 0.1; // Slightly in front of main bookshelf
            
            const bookEntity = new Entity({
                name: `Books-${i}`,
                rigidBodyOptions: { type: RigidBodyType.FIXED },
                blockTextureUri: shelfColors[i % shelfColors.length],
                blockHalfExtents: new Vector3(1.3, 0.3, 0.2), // Thin book shelf
            });
            await bookEntity.spawn(world, new Vector3(bookshelfPosition.x, shelfY, shelfZ));
        }
        
        logger.info("✅ Enhanced Bookshelf placeholder spawned.");

        // Side Table with Lamp
        const tablePosition = new Vector3(15, floorY + 0.75, 15);
        const tableHalfExtents = new Vector3(0.5, 0.5, 0.5);
        logger.info(`Spawning Side Table at ${tablePosition.toString()}`);
        
        // Table base
        const tableEntity = new Entity({
            name: "Side Table",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/oak-planks.png",
            blockHalfExtents: tableHalfExtents,
        });
        await tableEntity.spawn(world, new Vector3(tablePosition.x, tablePosition.y + tableHalfExtents.y, tablePosition.z));
        
        // Lamp on table
        const lampPosition = new Vector3(tablePosition.x, tablePosition.y + tableHalfExtents.y*2 + 0.2, tablePosition.z);
        const lampHalfExtents = new Vector3(0.3, 0.5, 0.3);
        const lampEntity = new Entity({
            name: "Lamp",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/ghostly-lantern.png",
            blockHalfExtents: lampHalfExtents,
        });
        await lampEntity.spawn(world, lampPosition);
        
        logger.info("✅ Side Table with Lamp spawned.");

        // Mystery Box / Strongbox
        const boxPosition = new Vector3(7, floorY + 1.6, 6); // On desk
        const boxHalfExtents = new Vector3(0.3, 0.3, 0.3);
        logger.info(`Spawning Mystery Box at ${boxPosition.toString()}`);
        
        const boxEntity = new Entity({
            name: "MysteryBox",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/stone.png", // Using built-in texture
            blockHalfExtents: boxHalfExtents,
        });
        await boxEntity.spawn(world, boxPosition);
        
        logger.info("✅ Mystery Box spawned on desk.");

        // Skull Decoration
        const skullPosition = new Vector3(fireplacePosition.x, fireplacePosition.y + fireplaceHalfExtents.y*2 + 0.6, fireplacePosition.z);
        const skullHalfExtents = new Vector3(0.3, 0.3, 0.3);
        logger.info(`Spawning Skull Decoration at ${skullPosition.toString()}`);
        
        const skullEntity = new Entity({
            name: "Skull",
            rigidBodyOptions: { type: RigidBodyType.FIXED },
            blockTextureUri: "blocks/glass.png", // Semi-transparent to look like bone
            blockHalfExtents: skullHalfExtents,
        });
        await skullEntity.spawn(world, skullPosition);
        
        logger.info("✅ Skull Decoration spawned on fireplace mantel.");

        logger.info('✅ Baker Street map layout created successfully.');
    } catch (error) {
        logger.error("❌ Error creating Baker Street map:", error);
    }
}

/**
 * Creates the Notebook and Clue entities.
 * @param world 
 */
export function createNotebookAndClue(world: World): void {
    logger.info('Scheduling Notebook and Clue entity creation...');

    // Delay creation slightly to potentially allow ModelRegistry to stabilize
    setTimeout(() => {
        logger.info('Executing delayed Notebook and Clue entity creation...');
        try {
            // Create and spawn Notebook
            const notebookPos = new Vector3(notebookPosition.x, notebookPosition.y, notebookPosition.z);
            const notebook = new NotebookEntity(notebookPos); // Assuming constructor takes position
            notebook.spawn(world); // Assuming spawn takes world
            logger.info(`✅ Notebook entity created and spawn called at ${JSON.stringify(notebookPosition)}`);

            // --- TEMPORARILY DISABLED DUE TO SDK ModelRegistry.getBoundingBox() CRASH ---
            // TODO: Investigate ModelRegistry timing/lookup issue preventing clue spawn.
            // Create and spawn Clue
            // const cluePos = new Vector3(cluePosition.x, cluePosition.y, cluePosition.z);
            // const clue = new ClueEntity(cluePos); // Constructor takes position
            // clue.spawn(world); // Spawn takes world
            // logger.info(`✅ Clue entity created and spawn called at ${JSON.stringify(cluePosition)}`);
            // ---------------------------------------------------------------------------

        } catch (error) {
            logger.error('Failed to create Notebook or Clue entities (delayed execution):', error);
        }
    }, 150); // Increased delay slightly to 150ms
}

// Be sure to call this function in the game initialization

// Potential future functions related to world management:
// export function loadMapFromFile(world: World, mapFilePath: string) { ... }
// export function spawnWorldObjects(world: World) { ... } 