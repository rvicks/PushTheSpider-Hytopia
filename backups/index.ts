/**
 * HYTOPIA SDK Boilerplate
 * 
 * This is a simple boilerplate to get started on your project.
 * It implements the bare minimum to be able to run and connect
 * to your game server and run around as the basic player entity.
 * 
 * From here you can begin to implement your own game logic
 * or do whatever you want!
 * 
 * You can find documentation here: https://github.com/hytopiagg/sdk/blob/main/docs/server.md
 * 
 * For more in-depth examples, check out the examples folder in the SDK, or you
 * can find it directly on GitHub: https://github.com/hytopiagg/sdk/tree/main/examples/payload-game
 * 
 * You can officially report bugs or request features here: https://github.com/hytopiagg/sdk/issues
 * 
 * To get help, have found a bug, or want to chat with
 * other HYTOPIA devs, join our Discord server:
 * https://discord.gg/DXCXJbHSJX
 * 
 * Official SDK Github repo: https://github.com/hytopiagg/sdk
 * Official SDK NPM Package: https://www.npmjs.com/package/hytopia
 */

/**
 * S.I.N. – Sentient Intelligence Nexus
 * A Sherlock Holmes puzzle adventure in a broken reality
 * Level 0: Baker Street Glitched Office
 */

import {
  startServer,
  Entity,
  PlayerEntity,
  PlayerEvent,
  BlockType,
  Audio,
  World,
  EntityEvent,
  RigidBodyType
} from 'hytopia';
import type { Vector3Like } from 'hytopia';

// Game configuration constants
const GROUND_LEVEL = 0;
const PLAYER_SPAWN_HEIGHT_OFFSET = 1;
const PLAYER_SPAWN: Vector3Like = { x: 0, y: GROUND_LEVEL + PLAYER_SPAWN_HEIGHT_OFFSET, z: 0 };

// Game state variables
let portalActivated = false;
let mysteriousVoicePlayed = false;

/**
 * Start the Hytopia game server
 * This function initializes our game world and sets up all necessary event handlers
 */
startServer(world => {
  console.log("=== S.I.N. SERVER STARTING ===");
  console.log("SDK Version:", require('hytopia/package.json').version);
  
  // Setup the initial scene - Baker Street Glitched Office (Level 0)
  setupBakerStreetGlitched(world);
  
  // Play ambient background music - creepy version for the glitched setting
  setupAmbientAudio(world);
  
  // Handle player joining the game
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    console.log(`Player joined: ${player.id}`);
    
    try {
      // Create Sherlock Holmes player entity
      const playerEntity = new PlayerEntity({
        player,
        name: 'Sherlock Holmes',
        modelUri: 'models/players/player.gltf',
        modelScale: 0.5,
      });
      
      // Spawn player at the defined spawn point - inside the Baker Street office
      playerEntity.spawn(world, PLAYER_SPAWN);
      
      // Let's make sure the entity is fully spawned before trying to play animations
      playerEntity.on('spawn', () => {
        console.log("Player entity fully spawned");
        
        // Handle animations properly for a ReadonlySet
        // Start the idle animation if it exists in the entity's looped animations
        try {
          playerEntity.startModelLoopedAnimations(['idle']);
          console.log("Started idle animation");
        } catch (error) {
          console.log("Could not start idle animation:", error);
        }
      });
      
      console.log(`Player spawned at (${PLAYER_SPAWN.x}, ${PLAYER_SPAWN.y}, ${PLAYER_SPAWN.z})`);
      
      // Send welcome message
      world.chatManager.sendPlayerMessage(player, 'Welcome to S.I.N. - Sentient Intelligence Nexus', '00FF00');
      world.chatManager.sendPlayerMessage(player, 'You are Sherlock Holmes, mysteriously awakened in a glitched version of your Baker Street home...', 'FFFF00');
      
      // Set up mysterious voice introduction (triggered when player approaches the portal)
      setupMysteriousVoice(world, player, playerEntity);
    } catch (error) {
      console.error("ERROR SPAWNING PLAYER:", error);
    }
  });
  
  // Handle player leaving
  world.on(PlayerEvent.LEFT_WORLD, ({ player }) => {
    console.log(`Player left: ${player.id}`);
    
    // Clean up player entities
    const playerEntities = world.entityManager.getAllEntities()
      .filter(entity => entity instanceof PlayerEntity && entity.player === player);
    
    playerEntities.forEach(entity => entity.despawn());
  });
  
  console.log("=== S.I.N. SERVER READY ===");
});

/**
 * Sets up Baker Street Glitched Office scene as Level 0
 * Creates a Victorian-era office with glitched elements and a mysterious portal
 * 
 * @param world - The game world to add entities to
 */
function setupBakerStreetGlitched(world: World): void {
  try {
    console.log("Setting up Baker Street Glitched Office scene...");
    
    // Create ground with stone pebbles texture
    createGround(world);
    
    // Create 221B Baker Street building with glitched elements
    createBakerStreetBuilding(world);
    
    // Create interactive elements (clues, puzzle elements)
    createInteractiveElements(world);
    
    // Add the mysterious portal that serves as the level transition
    createMysteriousPortal(world);
    
    console.log("Baker Street Glitched Office scene setup complete");
  } catch (error) {
    console.error("ERROR SETTING UP BAKER STREET:", error);
  }
}

/**
 * Creates the ground plane for the scene
 * 
 * @param world - The game world instance
 */
function createGround(world: World): void {
  // Create ground platform with weathered stone-pebbles texture
  const ground = new Entity({
    blockTextureUri: 'blocks/stone-pebbles.png',
    blockHalfExtents: { x: 50, y: 0.5, z: 50 },
  });
  ground.spawn(world, { x: 0, y: GROUND_LEVEL - 0.5, z: 0 });
}

/**
 * Creates the main 221B Baker Street building with glitched elements
 * 
 * @param world - The game world instance
 */
function createBakerStreetBuilding(world: World): void {
  // Main building structure
  const buildingPos = { x: 0, y: GROUND_LEVEL, z: 0 };
  
  // Create interior floor and walls
  createInterior(world, buildingPos);
  
  // Create exterior elements (walls, roof, stairs, etc.)
  createExterior(world, buildingPos);
  
  // Create glitched elements - things that are "wrong" with the building
  createGlitchedElements(world, buildingPos);
}

/**
 * Creates the interior of the 221B Baker Street office
 * 
 * @param world - The game world instance
 * @param position - The base position for the interior
 */
function createInterior(world: World, position: Vector3Like): void {
  const roomWidth = 10;
  const roomDepth = 12;
  const roomHeight = 5;
  
  // Floor - wooden flooring
  const floor = new Entity({
    blockTextureUri: 'blocks/oak-planks.png',
    blockHalfExtents: { x: roomWidth/2, y: 0.2, z: roomDepth/2 },
  });
  floor.spawn(world, { x: position.x, y: position.y, z: position.z });
  
  // Walls
  // Back wall (with fireplace)
  const backWall = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: roomWidth/2, y: roomHeight/2, z: 0.3 },
  });
  backWall.spawn(world, { x: position.x, y: position.y + roomHeight/2, z: position.z - roomDepth/2 });
  
  // Left wall
  const leftWall = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: 0.3, y: roomHeight/2, z: roomDepth/2 },
  });
  leftWall.spawn(world, { x: position.x - roomWidth/2, y: position.y + roomHeight/2, z: position.z });
  
  // Right wall (with window)
  const rightWall = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: 0.3, y: roomHeight/2, z: roomDepth/2 },
  });
  rightWall.spawn(world, { x: position.x + roomWidth/2, y: position.y + roomHeight/2, z: position.z });
  
  // Front wall (with door gap)
  const frontWallLeft = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: roomWidth/4 - 0.5, y: roomHeight/2, z: 0.3 },
  });
  frontWallLeft.spawn(world, { 
    x: position.x - roomWidth/4 - 0.5, 
    y: position.y + roomHeight/2, 
    z: position.z + roomDepth/2 
  });
  
  const frontWallRight = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: roomWidth/4 - 0.5, y: roomHeight/2, z: 0.3 },
  });
  frontWallRight.spawn(world, { 
    x: position.x + roomWidth/4 + 0.5, 
    y: position.y + roomHeight/2, 
    z: position.z + roomDepth/2 
  });
  
  // Door
  const door = new Entity({
    blockTextureUri: 'blocks/stone-brick-var.png',
    blockHalfExtents: { x: 1, y: 2, z: 0.1 },
  });
  door.spawn(world, { x: position.x, y: position.y + 2, z: position.z + roomDepth/2 });
  
  // Ceiling
  const ceiling = new Entity({
    blockTextureUri: 'blocks/oak-planks.png',
    blockHalfExtents: { x: roomWidth/2, y: 0.2, z: roomDepth/2 },
  });
  ceiling.spawn(world, { x: position.x, y: position.y + roomHeight, z: position.z });
  
  // Create interior furniture
  createFurniture(world, position, roomWidth, roomDepth);
}

/**
 * Creates the furniture for the Baker Street office
 * 
 * @param world - The game world instance
 * @param position - The base position for the furniture
 * @param roomWidth - Width of the room
 * @param roomDepth - Depth of the room
 */
function createFurniture(world: World, position: Vector3Like, roomWidth: number, roomDepth: number): void {
  // Fireplace
  const fireplace = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: 1.5, y: 1.5, z: 0.5 },
  });
  fireplace.spawn(world, { 
    x: position.x, 
    y: position.y + 1.5, 
    z: position.z - roomDepth/2 + 0.8 
  });
  
  // Fireplace opening with glowing brick
  const fireOpening = new Entity({
    blockTextureUri: 'blocks/lavaBlock.png',
    blockHalfExtents: { x: 0.8, y: 0.8, z: 0.1 },
  });
  fireOpening.spawn(world, { 
    x: position.x, 
    y: position.y + 1.2, 
    z: position.z - roomDepth/2 + 0.4 
  });
  
  // Desk
  const desk = new Entity({
    blockTextureUri: 'blocks/oak-planks.png',
    blockHalfExtents: { x: 1.5, y: 0.1, z: 0.8 },
  });
  desk.spawn(world, { 
    x: position.x - roomWidth/3.5, 
    y: position.y + 1, 
    z: position.z 
  });
  
  // Desk legs
  for (let i = 0; i < 4; i++) {
    const legX = position.x - roomWidth/3.5 + (i % 2 === 0 ? -1.2 : 1.2);
    const legZ = position.z + (i < 2 ? -0.6 : 0.6);
    
    const deskLeg = new Entity({
      blockTextureUri: 'blocks/oak-planks.png',
      blockHalfExtents: { x: 0.1, y: 0.5, z: 0.1 },
    });
    deskLeg.spawn(world, { x: legX, y: position.y + 0.5, z: legZ });
  }
  
  // Bookshelf
  const bookshelf = new Entity({
    blockTextureUri: 'blocks/oak-planks.png',
    blockHalfExtents: { x: 1.5, y: 2, z: 0.3 },
  });
  bookshelf.spawn(world, { 
    x: position.x + roomWidth/3, 
    y: position.y + 2, 
    z: position.z - roomDepth/3 
  });
  
  // Chair
  const chairSeat = new Entity({
    blockTextureUri: 'blocks/oak-planks.png',
    blockHalfExtents: { x: 0.4, y: 0.1, z: 0.4 },
  });
  chairSeat.spawn(world, { 
    x: position.x - roomWidth/3.5, 
    y: position.y + 0.6, 
    z: position.z + 1.5 
  });
  
  // Chair back
  const chairBack = new Entity({
    blockTextureUri: 'blocks/oak-planks.png',
    blockHalfExtents: { x: 0.4, y: 0.6, z: 0.1 },
  });
  chairBack.spawn(world, { 
    x: position.x - roomWidth/3.5, 
    y: position.y + 1.3, 
    z: position.z + 1.9 
  });
}

/**
 * Creates exterior elements for the Baker Street building
 * 
 * @param world - The game world instance
 * @param position - The base position for the exterior
 */
function createExterior(world: World, position: Vector3Like): void {
  const buildingWidth = 12;
  const buildingDepth = 14;
  const buildingHeight = 7;
  
  // Chimney
  const chimney = new Entity({
    blockTextureUri: 'blocks/dirty_bricks.png',
    blockHalfExtents: { x: 0.75, y: 2, z: 0.75 },
  });
  chimney.spawn(world, { 
    x: position.x, 
    y: position.y + buildingHeight + 2, 
    z: position.z - buildingDepth/2 
  });
  
  // Street lamps
  createStreetLamp(world, { x: position.x + 8, y: position.y, z: position.z + 8 });
  createStreetLamp(world, { x: position.x - 8, y: position.y, z: position.z + 8 });
}

/**
 * Creates a Victorian-style street lamp
 * 
 * @param world - The game world instance
 * @param position - The position to place the lamp
 */
function createStreetLamp(world: World, position: Vector3Like): void {
  // Lamp post
  const lampPost = new Entity({
    blockTextureUri: 'blocks/blackStone.png',
    blockHalfExtents: { x: 0.2, y: 2, z: 0.2 },
  });
  lampPost.spawn(world, { x: position.x, y: position.y + 2, z: position.z });
  
  // Lamp head
  const lampHead = new Entity({
    blockTextureUri: 'blocks/ghostly-lantern.png',
    blockHalfExtents: { x: 0.4, y: 0.4, z: 0.4 },
  });
  lampHead.spawn(world, { x: position.x, y: position.y + 4.4, z: position.z });
}

/**
 * Creates glitched elements within the Baker Street office
 * Visual indicators that something isn't right with this reality
 * 
 * @param world - The game world instance
 * @param position - The base position for the glitches
 */
function createGlitchedElements(world: World, position: Vector3Like): void {
  // Floating book - shouldn't be floating, indicates something's wrong
  const floatingBook = new Entity({
    blockTextureUri: 'blocks/emerald-block.png',
    blockHalfExtents: { x: 0.3, y: 0.05, z: 0.4 },
  });
  floatingBook.spawn(world, { x: position.x + 2, y: position.y + 1.8, z: position.z - 2 });
  
  // Make the book slowly rotate to indicate it's unnatural
  let bookRotationY = 0;
  floatingBook.on(EntityEvent.TICK, () => {
    bookRotationY += 0.01;
    floatingBook.setRotation({ x: 0, y: bookRotationY, z: 0, w: 1 });
  });
  
  // Glitched floor section - a piece of floor that's slightly out of place
  const glitchedFloor = new Entity({
    blockTextureUri: 'blocks/creep.png', // Unusual texture for a floor
    blockHalfExtents: { x: 0.5, y: 0.1, z: 0.5 },
  });
  glitchedFloor.spawn(world, { x: position.x + 3, y: position.y + 0.3, z: position.z + 3 });
  
  // Ceiling crack with unusual light
  const ceilingCrack = new Entity({
    blockTextureUri: 'blocks/swirl-rune.png',
    blockHalfExtents: { x: 0.6, y: 0.05, z: 0.6 },
  });
  ceilingCrack.spawn(world, { x: position.x - 3, y: position.y + 4.95, z: position.z });
}

/**
 * Creates interactive elements for puzzle-solving in the scene
 * 
 * @param world - The game world instance
 */
function createInteractiveElements(world: World): void {
  // A magnifying glass clue object
  const magnifyingGlass = new Entity({
    blockTextureUri: 'blocks/glass.png',
    blockHalfExtents: { x: 0.2, y: 0.05, z: 0.2 },
  });
  magnifyingGlass.spawn(world, { x: -3, y: GROUND_LEVEL + 1.1, z: 1 });
  
  // Add collision event for player picking up the clue
  magnifyingGlass.on(EntityEvent.ENTITY_COLLISION, ({ otherEntity, started }) => {
    if (started && otherEntity instanceof PlayerEntity) {
      // When player touches the magnifying glass
      world.chatManager.sendPlayerMessage(otherEntity.player, 
        'You found your trusty magnifying glass! Something feels off about this place...', 
        'FFFF00');
        
      // Make the magnifying glass disappear
      setTimeout(() => {
        magnifyingGlass.despawn();
      }, 500);
    }
  });
}

/**
 * Creates the mysterious portal that will trigger Level 1
 * 
 * @param world - The game world instance
 */
function createMysteriousPortal(world: World): void {
  // Create a swirling portal with glowing effect
  const portal = new Entity({
    blockTextureUri: 'blocks/swirl-rune.png',
    blockHalfExtents: { x: 1, y: 2, z: 0.1 },
  });
  portal.spawn(world, { x: -5, y: GROUND_LEVEL + 2, z: -5 });
  
  // Add a trigger zone around the portal with transparent glass texture
  // Use a nearly transparent texture that will act as our trigger zone
  const portalTriggerZone = new Entity({
    blockTextureUri: 'blocks/glass.png', // Using glass as it's mostly transparent
    blockHalfExtents: { x: 2, y: 2, z: 2 },
  });
  portalTriggerZone.spawn(world, { x: -5, y: GROUND_LEVEL + 2, z: -5 });
  
  // Make the portal slowly rotate for a magical effect
  let portalRotationY = 0;
  portal.on(EntityEvent.TICK, () => {
    portalRotationY += 0.01;
    portal.setRotation({ x: 0, y: portalRotationY, z: 0, w: 1 });
  });

  // We'll use a simpler approach for detecting player proximity to portal
  // Just set up a collision detection between player and portal trigger zone
  portalTriggerZone.on(EntityEvent.ENTITY_COLLISION, ({ otherEntity, started }) => {
    if (started && otherEntity instanceof PlayerEntity && !mysteriousVoicePlayed) {
      mysteriousVoicePlayed = true;
      
      // Send mysterious messages
      world.chatManager.sendPlayerMessage(otherEntity.player, 'You hear a mysterious female voice...', 'FF00FF');
      setTimeout(() => {
        world.chatManager.sendPlayerMessage(otherEntity.player, 'Sherlock... come closer...', 'FF00FF');
      }, 2000);
      setTimeout(() => {
        world.chatManager.sendPlayerMessage(otherEntity.player, 'The future needs you... step through the portal...', 'FF00FF');
      }, 4000);
    }
  });
}

/**
 * Sets up the mysterious voice that calls to the player
 * 
 * @param world - The game world instance
 * @param player - The player who joined
 * @param playerEntity - The player's entity
 */
function setupMysteriousVoice(world: World, player: any, playerEntity: PlayerEntity): void {
  // Voice will be triggered by the collision detection on the portal trigger zone
  console.log("Mysterious voice setup complete - will trigger on portal approach");
}

/**
 * Sets up ambient background audio for the scene
 * 
 * @param world - The game world to add audio to
 */
function setupAmbientAudio(world: World): void {
  try {
    // Make sure the audio URI is correct and the file exists
    const audioUri = 'audio/music/creepy-night-theme.mp3';
    console.log(`Attempting to play audio: ${audioUri}`);
    
    // Create ambient background audio with proper configuration
    const ambientAudio = new Audio({
      uri: audioUri,
      loop: true,
      volume: 0.3
    });
    
    // Start playing for all players
    ambientAudio.play(world);
    console.log("Ambient audio started");
  } catch (error) {
    console.error("ERROR SETTING UP AUDIO:", error);
  }
}
