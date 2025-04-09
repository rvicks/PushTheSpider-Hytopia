# GLB File Integration Guide for Hytopia

This guide addresses the issues with using GLB files in Hytopia for props, furniture, and decorations to improve player immersion and engagement.

## Understanding GLB Files in Hytopia

GLB files are the binary version of GLTF (GL Transmission Format) files, which are a standard format for 3D models. Hytopia supports both GLTF and GLB formats for Model Entities, making them ideal for implementing detailed props and furniture that would be difficult to create with the standard block-based building system.

## Step-by-Step Integration Guide

### 1. Preparing Your GLB Files

#### File Requirements
- File format: `.glb` or `.gltf`
- Recommended size: Keep models optimized (under 5MB when possible)
- Textures: PNG format, max 2048×2048 resolution
- Naming convention: Use lowercase, no spaces (e.g., `wooden_desk.glb` not `Wooden Desk.glb`)

#### Model Optimization Tips
- Reduce polygon count where possible without sacrificing visual quality
- Ensure proper UV unwrapping for textures
- Use PBR materials for best visual results
- Include animations if the prop needs to move (e.g., opening doors, drawers)

### 2. Organizing Your Assets

Create a proper directory structure:

```
assets/
└── models/
    ├── furniture/
    │   ├── chairs/
    │   ├── tables/
    │   ├── beds/
    │   └── storage/
    ├── decorations/
    │   ├── lamps/
    │   ├── plants/
    │   └── artwork/
    └── props/
        ├── books/
        ├── electronics/
        └── misc/
```

### 3. Implementing GLB Models as Entities

Use the following code pattern to add furniture and props to your game:

```typescript
import { startServer, Entity, RigidBodyType } from 'hytopia';

startServer(world => {
  // Create a desk entity
  const desk = new Entity({
    name: 'Wooden Desk',
    modelUri: 'models/furniture/tables/wooden_desk.glb',
    modelScale: 0.5, // Adjust scale to match your game's proportions
    rigidBodyOptions: {
      type: RigidBodyType.STATIC, // For immovable furniture
      // For furniture that shouldn't move but can be pushed with enough force:
      // type: RigidBodyType.DYNAMIC,
      // mass: 100, // Higher mass makes it harder to move
    }
  });
  
  // Spawn the desk in the world
  desk.spawn(world, { x: 10, y: 0, z: 15 });
  
  // Create a lamp with a light source
  const lamp = new Entity({
    name: 'Table Lamp',
    modelUri: 'models/decorations/lamps/table_lamp.glb',
    modelScale: 0.4,
    // Add a point light to the lamp
    lightOptions: {
      type: 'point',
      color: { r: 1.0, g: 0.9, b: 0.7 }, // Warm light
      intensity: 0.8,
      range: 10,
      position: { x: 0, y: 1.2, z: 0 } // Position relative to entity
    }
  });
  
  // Spawn the lamp on top of the desk
  lamp.spawn(world, { x: 10, y: 1.2, z: 15 });
});
```

### 4. Creating Interactive Furniture

For furniture that players can interact with:

```typescript
import { startServer, Entity, EntityEvent, PlayerEvent } from 'hytopia';

startServer(world => {
  // Create an interactive bookcase
  const bookcase = new Entity({
    name: 'Bookcase',
    modelUri: 'models/furniture/storage/bookcase.glb',
    modelScale: 0.8,
    // Start with closed animation state
    modelLoopedAnimations: ['closed'],
  });
  
  // Make the bookcase interactive
  bookcase.on(EntityEvent.ENTITY_INTERACTION, ({ player }) => {
    // Toggle between open and closed states
    if (bookcase.modelLoopedAnimations.has('closed')) {
      bookcase.stopModelAnimations(['closed']);
      bookcase.startModelOneshotAnimations(['opening']);
      
      // After animation completes, you might want to trigger an event
      setTimeout(() => {
        // For example, reveal a hidden clue or item
        player.sendMessage('You found a hidden note behind the books!');
        
        // Add item to player inventory or trigger game event
        // player.inventory.addItem('secret_note');
      }, 1500); // Adjust timing based on animation length
    } else {
      bookcase.startModelOneshotAnimations(['closing']);
      bookcase.startModelLoopedAnimations(['closed']);
    }
  });
  
  // Spawn the bookcase
  bookcase.spawn(world, { x: 5, y: 0, z: 8 });
});
```

### 5. Batch Placement for Room Furnishing

For efficiently furnishing entire rooms:

```typescript
// Function to create a furnished room
function createBedroomFurniture(world, roomCenter, rotation = 0) {
  const { x, y, z } = roomCenter;
  
  // Create and place bed
  const bed = new Entity({
    modelUri: 'models/furniture/beds/double_bed.glb',
    modelScale: 0.7,
  });
  bed.spawn(world, { x: x - 2, y, z: z + 1 });
  
  // Create and place nightstand
  const nightstand = new Entity({
    modelUri: 'models/furniture/tables/nightstand.glb',
    modelScale: 0.5,
  });
  nightstand.spawn(world, { x: x - 3.5, y, z: z + 1 });
  
  // Create and place wardrobe
  const wardrobe = new Entity({
    modelUri: 'models/furniture/storage/wardrobe.glb',
    modelScale: 0.8,
  });
  wardrobe.spawn(world, { x: x + 3, y, z: z - 2 });
  
  // Add more furniture as needed...
  
  return {
    bed,
    nightstand,
    wardrobe,
    // Return all furniture entities for later reference
  };
}

// Usage
const bedroomFurniture = createBedroomFurniture(world, { x: 20, y: 0, z: 20 });
```

### 6. Troubleshooting Common GLB Issues

#### Model Not Appearing

1. **Check file path**: Ensure the `modelUri` path is correct and relative to the `assets` folder
   ```typescript
   // Correct
   modelUri: 'models/furniture/chairs/office_chair.glb'
   
   // Incorrect
   modelUri: '/models/furniture/chairs/office_chair.glb' // Don't include leading slash
   modelUri: 'assets/models/furniture/chairs/office_chair.glb' // Don't include 'assets/'
   ```

2. **Verify file naming**: GLB filenames should be lowercase with no spaces
   ```
   // Good filenames
   wooden_desk.glb
   office_chair_v2.glb
   
   // Problematic filenames
   Wooden Desk.glb  // Contains spaces
   Office-Chair.glb // Contains uppercase letters
   ```

3. **Check model scale**: If the model is too small or too large, it might not be visible
   ```typescript
   // Try different scales if model isn't visible
   modelScale: 1.0  // Default scale
   modelScale: 0.1  // Much smaller
   modelScale: 10.0 // Much larger
   ```

4. **Inspect model format**: Ensure your GLB file is properly formatted
   - Use [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/) to validate your model
   - Check for errors in the console when loading the model

#### Model Appears Distorted or Incorrectly Positioned

1. **Check model orientation**: Some models may need rotation adjustment
   ```typescript
   // Rotate model 90 degrees around Y axis
   entity.rotation = { x: 0, y: Math.PI / 2, z: 0 };
   ```

2. **Adjust model position**: Fine-tune the position after spawning
   ```typescript
   // Adjust height to sit properly on the floor
   entity.position = { x: entity.position.x, y: entity.position.y + 0.5, z: entity.position.z };
   ```

### 7. Converting Other 3D Formats to GLB

If you have models in other formats (OBJ, FBX, etc.), you can convert them to GLB:

1. **Using Blender (Free)**:
   - Import your model into Blender
   - Go to File > Export > glTF 2.0 (.glb/.gltf)
   - Select GLB format and configure export options
   - Export to your project's models directory

2. **Using Online Converters**:
   - [AssethHero](https://assethero.gbusto.com/) - Can convert images to 3D models
   - [Online 3D Converter](https://www.online-convert.com/3d-converter)
   - [Sketchfab](https://sketchfab.com/) - Has model conversion tools

### 8. Finding Free GLB Models

Here are some resources for free GLB models suitable for your game:

1. **Sketchfab** - [sketchfab.com/tags/glb](https://sketchfab.com/tags/glb)
   - Many free models with CC licenses
   - Filter by "Downloadable" and "Free"

2. **CGTrader** - [cgtrader.com/free-3d-models](https://www.cgtrader.com/free-3d-models)
   - Large collection of free furniture and props
   - Check file format availability (many support GLB export)

3. **TurboSquid** - [turbosquid.com/Search/3D-Models/free/glb](https://www.turbosquid.com/Search/3D-Models/free/glb)
   - Professional quality models with free options
   - Filter by "Free" and "GLB" format

4. **Poly Pizza** - [poly.pizza](https://poly.pizza/)
   - Low-poly models ideal for games
   - Most available in GLB format

## Optimizing Performance with Many GLB Models

To maintain good performance when using many GLB models:

1. **Level of Detail (LOD)**:
   ```typescript
   // Create different versions of the same model at different detail levels
   const highDetailDesk = new Entity({
     modelUri: 'models/furniture/tables/desk_high.glb',
     modelScale: 0.5,
   });
   
   const lowDetailDesk = new Entity({
     modelUri: 'models/furniture/tables/desk_low.glb',
     modelScale: 0.5,
   });
   
   // Show high detail model when player is close, low detail when far
   world.on(PlayerEvent.PLAYER_MOVED, ({ player }) => {
     const distanceToDesk = calculateDistance(player.position, highDetailDesk.position);
     
     if (distanceToDesk < 10) {
       if (!highDetailDesk.isSpawned) {
         lowDetailDesk.despawn();
         highDetailDesk.spawn(world, lowDetailDesk.position);
       }
     } else {
       if (!lowDetailDesk.isSpawned) {
         highDetailDesk.despawn();
         lowDetailDesk.spawn(world, highDetailDesk.position);
       }
     }
   });
   ```

2. **Instancing for Repeated Models**:
   ```typescript
   // For repeated identical items (e.g., chairs around a table)
   // Create once and spawn multiple times
   const chairPositions = [
     { x: 10, y: 0, z: 10 },
     { x: 10, y: 0, z: 12 },
     { x: 12, y: 0, z: 10 },
     { x: 12, y: 0, z: 12 },
   ];
   
   // Create chair entity once
   const chair = new Entity({
     modelUri: 'models/furniture/chairs/dining_chair.glb',
     modelScale: 0.5,
   });
   
   // Spawn multiple instances
   chairPositions.forEach(position => {
     chair.clone().spawn(world, position);
   });
   ```

3. **Async Loading**:
   ```typescript
   // Load models asynchronously as players approach different areas
   function loadRoomFurniture(roomId, playerPosition) {
     // Calculate distance to room
     const roomCenter = getRoomCenter(roomId);
     const distance = calculateDistance(playerPosition, roomCenter);
     
     // Only load furniture when player is close enough
     if (distance < 30 && !roomFurnitureLoaded[roomId]) {
       createRoomFurniture(world, roomId, roomCenter);
       roomFurnitureLoaded[roomId] = true;
     }
   }
   
   // Check on player movement
   world.on(PlayerEvent.PLAYER_MOVED, ({ player }) => {
     // Check all nearby rooms
     nearbyRooms.forEach(roomId => {
       loadRoomFurniture(roomId, player.position);
     });
   });
   ```

This implementation guide should help you successfully integrate GLB models as furniture, props, and decorations in your Hytopia game, improving player immersion and engagement.
