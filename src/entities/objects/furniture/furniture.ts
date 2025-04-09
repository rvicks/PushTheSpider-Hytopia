import {
    Entity as HytopiaEntity, // Use our re-exported base Entity
    type World,
    type EntityOptions,
    type Vector3Like, // Use Hytopia's vector type
    RigidBodyType, // Import the enum for physics type
    type ModelEntityOptions // Import this to help TypeScript narrow types
} from 'hytopia';
import { logger } from '../../../utils/logger';

/**
 * Configuration defining a specific type of furniture.
 * This defines the core properties specific to a furniture type.
 * Other standard EntityOptions can be passed during spawning for overrides.
 */
export interface FurnitureConfig {
    type: string;         // e.g., 'chair', 'desk', 'lamp'
    modelUri: string;     // Path to the GLTF model
    // --- Optional defaults that can be overridden by EntityOptions during spawn ---
    defaultName?: string;
    defaultModelScale?: number;
    defaultModelLoopedAnimations?: string[];
    defaultRigidBodyOptions?: EntityOptions['rigidBodyOptions']; // Use Hytopia's type
    // --- Add other custom furniture-specific properties if needed ---
    // isInteractable?: boolean;
}

/**
 * Checks if the provided options object likely includes model-specific properties.
 * This is a simple type guard to help TypeScript.
 */
function hasModelOptions(options: Partial<EntityOptions>): options is Partial<ModelEntityOptions> {
    return 'modelScale' in options || 'modelUri' in options || 'modelLoopedAnimations' in options;
}

/**
 * Base class for Furniture entities, extending Hytopia's base Entity.
 */
export class FurnitureEntity extends HytopiaEntity {
    public readonly furnitureType: string;

    constructor(options: Partial<EntityOptions>, config: FurnitureConfig) {
        // Determine model scale and animations safely
        let scale = config.defaultModelScale ?? 1;
        let animations = config.defaultModelLoopedAnimations;
        if (hasModelOptions(options)) {
            scale = options.modelScale ?? scale; // Prioritize option if it exists
            animations = options.modelLoopedAnimations || animations; // Prioritize option
        }

        // Construct the final EntityOptions, prioritizing passed options over config defaults
        const finalOptions: EntityOptions = {
            name: options.name || config.defaultName || `furniture-${config.type}-${Date.now()}`,
            modelUri: config.modelUri, // Required from config
            modelScale: scale, // Use safely determined scale
            modelLoopedAnimations: animations, // Use safely determined animations

            // Physics Setup - Prioritize options, then config defaults, then FIXED
            rigidBodyOptions: {
                type: RigidBodyType.FIXED, // Default to FIXED for furniture
                ...(config.defaultRigidBodyOptions || {}), // Apply config defaults first
                ...(options.rigidBodyOptions || {}),      // Override with passed options
            },

            // Include any other options passed in, allowing override of anything above
            ...options,
        };

        super(finalOptions);
        this.furnitureType = config.type;
        logger.debug(`FurnitureEntity created: Type=${this.furnitureType}, ID=${this.id}, Name=${finalOptions.name}`);
    }

    /**
     * Spawns the furniture entity in the world at the specified position.
     * @param world The Hytopia World instance.
     * @param position The position to spawn the furniture at.
     */
    public spawn(world: World, position: Vector3Like): void {
        try {
            logger.info(`Spawning furniture: Type=${this.furnitureType}, ID=${this.id} at ${JSON.stringify(position)}`);
            super.spawn(world, position);
            logger.info(`✅ Furniture ID=${this.id} spawned successfully.`);
            // Post-spawn logic can access options via this.options if needed, e.g.:
            // logger.debug(`Spawned with scale: ${this.options.modelScale}`);
        } catch (error) {
            logger.error(`Failed to spawn furniture ID=${this.id}:`, error);
        }
    }

    // Note: Despawn is inherited from HytopiaEntity
}

/**
 * Spawns a specific type of furniture entity.
 *
 * @param world The Hytopia world instance.
 * @param config The configuration defining the furniture type.
 * @param position The position to spawn the furniture at.
 * @param options Optional overrides/additions for the EntityOptions.
 * @returns The spawned FurnitureEntity instance or null if spawning failed.
 */
export function spawnFurniture(
    world: World,
    config: FurnitureConfig,
    position: Vector3Like,
    options: Partial<EntityOptions> = {}
): FurnitureEntity | null {
    try {
        // Pass both config and options to the constructor
        const furniture = new FurnitureEntity(options, config);
        furniture.spawn(world, position);
        return furniture;
    } catch (error) {
        logger.error(`Error in spawnFurniture function for type ${config.type}:`, error);
        return null;
    }
}

// Example Usage (can be moved to world.ts or a level setup file):
/*
import { spawnFurniture, type FurnitureConfig } from './furniture';
import type { Vector3Like } from 'hytopia';
import { RigidBodyType } from 'hytopia'; // Make sure to import enums too

const deskConfig: FurnitureConfig = {
    type: 'desk',
    modelUri: 'models/furniture/desk_vintage.gltf',
    defaultName: 'Vintage Desk',
    defaultModelScale: 1.2,
};

const dynamicChairConfig: FurnitureConfig = {
    type: 'chair',
    modelUri: 'models/furniture/chair_swivel.gltf',
    defaultRigidBodyOptions: { // Example: make chairs dynamic by default
        type: RigidBodyType.DYNAMIC,
        additionalMass: 5,
    }
};

function setupOfficeScene(world: World, officeCenter: Vector3Like) {
    // Spawn desk using mostly defaults from config
    spawnFurniture(world, deskConfig, { x: officeCenter.x, y: officeCenter.y, z: officeCenter.z });

    // Spawn chair, overriding the name and scale, but keeping dynamic physics from config
    spawnFurniture(world, dynamicChairConfig,
        { x: officeCenter.x + 1, y: officeCenter.y, z: officeCenter.z },
        { name: 'SwivelChair01', modelScale: 0.9 }
    );

    // Spawn another chair, but make this specific one FIXED
    spawnFurniture(world, dynamicChairConfig,
        { x: officeCenter.x - 1, y: officeCenter.y, z: officeCenter.z },
        { name: 'FixedChair02', rigidBodyOptions: { type: RigidBodyType.FIXED } }
    );
}
*/ 