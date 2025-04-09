import { World, Entity, RigidBodyType, type Vector3Like } from 'hytopia';
import { logger } from './logger';

/**
 * Spawns a model entity using cleaned paths to mitigate potential optimization issues
 * related to file paths containing spaces, while logging the process.
 * 
 * @param world The world instance to spawn the model in.
 * @param modelPath Path to the model file (relative to assets directory, e.g., 'custom/desk').
 * @param position Position to spawn the model.
 * @param scale Model scale (default: 1).
 * @returns The spawned entity.
 * @throws Error if spawning fails.
 */
export function spawnModelSafely(world: World, modelPath: string, position: Vector3Like, scale: number = 1): Entity {
  // Clean the model path for safe usage
  let cleanPath = modelPath;

  // Ensure 'models/' prefix
  if (!cleanPath.startsWith('models/')) {
    cleanPath = `models/${cleanPath}`;
  }

  // Ensure .glb or .gltf extension (prefer .glb)
  if (!cleanPath.endsWith('.glb') && !cleanPath.endsWith('.gltf')) {
    cleanPath += '.glb';
  }

  // Replace spaces just in case (though optimization is disabled, good practice)
  // const originalPath = cleanPath;
  cleanPath = cleanPath.replace(/ /g, '_');
  // if (originalPath !== cleanPath) {
  //   logger.debug(`Cleaned model path spaces: ${originalPath} -> ${cleanPath}`);
  // }

  logger.info(`Spawning model: ${cleanPath} at ${JSON.stringify(position)} with scale ${scale}`);

  try {
    const entity = new Entity({
      name: `Model_${cleanPath.split('/').pop()?.split('.')[0]}`,
      modelUri: cleanPath,
      modelScale: scale,
      rigidBodyOptions: {
        type: RigidBodyType.FIXED // Assuming fixed by default for scenery
      }
    });

    entity.spawn(world, position);
    logger.info(`✅ Model spawned successfully: ${cleanPath}`);
    return entity;
  } catch (error) {
    logger.error(`❌ Failed to spawn model: ${cleanPath}`, error);
    throw error; // Re-throw to indicate failure
  }
}

/**
 * Spawns different furniture types as block entities with appropriate shapes and textures.
 * This avoids using GLB models directly, bypassing potential model optimization issues.
 * 
 * @param world The world instance to spawn the furniture in.
 * @param type Type of furniture (e.g., 'desk', 'table', 'chair', 'bed', 'bookshelf', 'cabinet').
 * @param position Position to spawn.
 * @param scale Scale factor (default: 1).
 * @param color Color name or hex code (e.g., 'RED', 'FF0000') to influence texture (optional).
 * @returns The spawned entity.
 * @throws Error if spawning fails.
 */
export function spawnFurnitureAsBlock(world: World, type: string, position: Vector3Like, scale: number = 1, color: string = 'FFFFFF'): Entity {
  const typeLower = type.toLowerCase();
  logger.info(`Creating furniture block: ${typeLower} at ${JSON.stringify(position)}`);

  let halfExtents = { x: scale * 0.5, y: scale * 0.5, z: scale * 0.5 }; // Default to cube based on scale
  let textureType = 'stone'; // Default texture

  // Customize dimensions and default texture based on type
  switch (typeLower) {
    case 'desk':
      halfExtents = { x: scale * 0.75, y: scale * 0.4, z: scale * 0.4 }; // Wider than deep
      textureType = 'oak-planks';
      break;
    case 'table':
      halfExtents = { x: scale * 0.6, y: scale * 0.05, z: scale * 0.6 }; // Square and flat
      textureType = 'oak-planks';
      break;
    case 'chair':
      halfExtents = { x: scale * 0.3, y: scale * 0.5, z: scale * 0.3 }; // Smaller, slightly taller
      textureType = 'oak-planks';
      break;
    case 'bed':
      halfExtents = { x: scale * 0.5, y: scale * 0.2, z: scale * 1.0 }; // Long and flat
      textureType = 'stone'; // Placeholder, was wool
      break;
    case 'bookshelf':
      halfExtents = { x: scale * 0.75, y: scale * 0.9, z: scale * 0.25 }; // Tall and thin
      textureType = 'stone'; // Placeholder, was bookshelf
      break;
    case 'cabinet':
      halfExtents = { x: scale * 0.5, y: scale * 0.7, z: scale * 0.25 }; // Medium height
      textureType = 'oak-planks';
      break;
    default:
      logger.warn(`Unknown furniture type '${type}'. Using default block.`);
      halfExtents = { x: scale * 0.5, y: scale * 0.5, z: scale * 0.5 };
      textureType = 'stone';
  }

  // Adjust halfExtents to be based on the provided scale factor directly affecting size
  halfExtents = {
       x: halfExtents.x * scale,
       y: halfExtents.y * scale,
       z: halfExtents.z * scale
  };

  // Override texture based on color
  if (color && color !== 'FFFFFF') {
    const colorUpper = color.toUpperCase();
    switch (colorUpper) {
      case 'RED': case 'FF0000': textureType = 'bricks'; break;
      case 'GREEN': case '00FF00': textureType = 'stone'; break; // Was emerald
      case 'BLUE': case '0000FF': textureType = 'stone'; break; // Was lapis
      case 'YELLOW': case 'FFFF00': textureType = 'stone'; break; // Was gold
      case 'BLACK': case '000000': textureType = 'stone'; break; // Was coal
      default:
        logger.warn(`Unsupported color '${color}'. Using default texture for type '${typeLower}'.`);
    }
  }

  const texturePath = `blocks/${textureType}.png`;
  logger.debug(`Using texture: ${texturePath}`);

  try {
    const blockEntity = new Entity({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}Block`,
      blockTextureUri: texturePath,
      blockHalfExtents: halfExtents, // Use calculated dimensions
      rigidBodyOptions: {
        type: RigidBodyType.FIXED // Furniture is typically static
      }
    });

    blockEntity.spawn(world, position);
    logger.info(`✅ ${type} furniture block spawned successfully`);
    return blockEntity;
  } catch (error) {
    logger.error(`❌ Failed to spawn ${type} furniture block:`, error);
    throw error;
  }
}

/**
 * Deprecated: Use spawnFurnitureAsBlock instead.
 * Creates a model-like entity using block properties to avoid GLB issues.
 * @deprecated Prefer spawnFurnitureAsBlock for clarity and better dimension control.
 */
export function createSafeModelEntity(world: World, type: string, position: Vector3Like, scale: number = 1): Entity {
  logger.warn('Deprecated function createSafeModelEntity called. Use spawnFurnitureAsBlock instead.');
  return spawnFurnitureAsBlock(world, type, position, scale);
} 