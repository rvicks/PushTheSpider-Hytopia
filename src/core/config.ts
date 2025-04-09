import type { Vector3Like } from 'hytopia';
import { logger } from '../utils/logger'; // Import logger

// Game configuration constants
export const GROUND_LEVEL = 0;
export const PLAYER_SPAWN_HEIGHT_OFFSET = 1;
// Adjusted spawn point to be inside the generated room
export const PLAYER_SPAWN: Vector3Like = { x: 10, y: 1.5, z: 10 }; // Standard spawn height

// Animation name constants
export const ANIMATIONS = {
  IDLE: 'Idle',
  IDLE_UPPER: 'idle_upper',
  IDLE_LOWER: 'idle_lower',
  WALK: 'walk',
  WALK_UPPER: 'Walk_Upper',
  WALK_LOWER: 'Walk_Lower',
  JUMP: 'Jump',
  JUMP_LOOP: 'Jump_Loop'
};

// Log the defined animation names on startup
logger.info(`[CONFIG] Defined Animation Names: ${JSON.stringify(ANIMATIONS)}`);

// Player controller settings
export const PLAYER_SETTINGS = {
  RUN_VELOCITY: 4.0,        // Speed when holding Shift
  WALK_VELOCITY: 2.5,       // Base speed (Increased from 1.5)
  JUMP_VELOCITY: 8.0,       // Initial upward velocity for jump
  JUMP_COOLDOWN_MS: 500,    // Minimum time between jumps
  INTERACT_DISTANCE: 3.0,   // Max distance for interaction raycast
};

// Camera settings are now defined in camera-manager.ts

// Map Creation Settings
export const BAKER_STREET_MAP = {
  ROOM_WIDTH: 30,
  ROOM_LENGTH: 25,
  ROOM_HEIGHT: 6, // Increased height from previous debugging
  FLOOR_BLOCK_ID: 101,
  WALL_BLOCK_ID: 102,
  FLOOR_TEXTURE: 'blocks/oak-planks.png',
  WALL_TEXTURE: 'blocks/bricks.png'
};

// Server Stats Tracking
export const SERVER_START_TIME = new Date();
// Note: TOTAL_CONNECTIONS needs to be managed dynamically, not a const

// Model paths (centralize defaults)
export const DEFAULT_PLAYER_MODEL = 'models/players/player.gltf';

// Collision Groups (If specific groups are needed beyond defaults)
// export const CUSTOM_COLLISION_GROUPS = { ... };