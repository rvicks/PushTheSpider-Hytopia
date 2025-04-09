# Implementation Examples

This file contains practical code examples that demonstrate how to implement the various technical solutions in your S.I.N. game project.

## Avatar Animation Example

```typescript
// index.ts - Main game file
import { startServer, PlayerEvent, PlayerEntity } from 'hytopia';

startServer(world => {
  // Set up player initialization
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    // Create player entity with proper animations
    const playerEntity = new PlayerEntity({
      player,
      name: 'Sherlock',
      modelUri: 'models/characters/sherlock.glb', // Make sure this model has walk, run, and idle animations
      modelLoopedAnimations: ['idle'], // Start with idle animation
      modelScale: 0.5,
    });
    
    // Implement custom character controller with proper animation handling
    class SherlockController extends BaseCharacterController {
      public tickPlayerMovement(inputState: PlayerInputState, orientationState: PlayerOrientationState, deltaTimeMs: number) {
        // Get current pressed key state
        const { w, a, s, d, sp, sh } = inputState;
        
        // Determine if player is moving
        const isMoving = w || a || s || d;
        
        // Determine if running (shift key pressed)
        const isRunning = isMoving && sh;
        
        // Check if player is on the ground
        if (this.isGrounded) {
          if (isMoving) {
            if (isRunning) {
              // Stop all animations that aren't run
              this.entity.stopModelAnimations(
                Array.from(this.entity.modelLoopedAnimations).filter(v => v !== 'run')
              );
              // Play run animation
              this.entity.startModelLoopedAnimations(['run']);
            } else {
              // Stop all animations that aren't walk
              this.entity.stopModelAnimations(
                Array.from(this.entity.modelLoopedAnimations).filter(v => v !== 'walk')
              );
              // Play walk animation
              this.entity.startModelLoopedAnimations(['walk']);
            }
          } else {
            // Stop all animations that aren't idle
            this.entity.stopModelAnimations(
              Array.from(this.entity.modelLoopedAnimations).filter(v => v !== 'idle')
            );
            // Play idle animation
            this.entity.startModelLoopedAnimations(['idle']);
          }
        }
        
        // Rest of your movement code...
        super.tickPlayerMovement(inputState, orientationState, deltaTimeMs);
      }
    }
    
    // Assign controller to player entity
    const controller = new SherlockController();
    playerEntity.setController(controller);
    
    // Spawn player in starting position
    playerEntity.spawn(world, { x: 0, y: 1, z: 0 });
  });
});
```

## Crosshair Implementation Example

```html
<!-- assets/ui/index.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Game UI container */
    .game-ui {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    
    /* Crosshair container - centered in viewport */
    .crosshair-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
    }
    
    /* Basic crosshair style */
    .crosshair {
      width: 20px;
      height: 20px;
      position: relative;
    }
    
    /* Crosshair lines */
    .crosshair::before,
    .crosshair::after {
      content: '';
      position: absolute;
      background-color: rgba(255, 255, 255, 0.8);
    }
    
    /* Vertical line */
    .crosshair::before {
      width: 2px;
      height: 20px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    /* Horizontal line */
    .crosshair::after {
      width: 20px;
      height: 2px;
      top: 50%;
      transform: translateY(-50%);
    }
    
    /* Center dot */
    .crosshair-dot {
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  </style>
</head>
<body>
  <div class="game-ui">
    <!-- Crosshair element -->
    <div class="crosshair-container">
      <div class="crosshair">
        <div class="crosshair-dot"></div>
      </div>
    </div>
  </div>
</body>
</html>
```

```typescript
// In your game's main file (e.g., index.ts)
import { startServer, PlayerEvent } from 'hytopia';

startServer(world => {
  // Set up UI loading for players when they join
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    // Load the UI for the player
    player.ui.load('ui/index.html');
    
    // Other player initialization...
  });
});
```

## GLB File Integration Example

```typescript
// furniture.ts - Module for creating furniture
import { Entity, RigidBodyType, World } from 'hytopia';

// Function to create a furnished office
export function createOffice(world: World, roomCenter: {x: number, y: number, z: number}) {
  const { x, y, z } = roomCenter;
  
  // Create desk
  const desk = new Entity({
    name: 'Wooden Desk',
    modelUri: 'models/furniture/tables/wooden_desk.glb',
    modelScale: 0.5,
    rigidBodyOptions: {
      type: RigidBodyType.STATIC,
    }
  });
  desk.spawn(world, { x: x, y, z: z });
  
  // Create office chair
  const chair = new Entity({
    name: 'Office Chair',
    modelUri: 'models/furniture/chairs/office_chair.glb',
    modelScale: 0.5,
    rigidBodyOptions: {
      type: RigidBodyType.DYNAMIC,
      mass: 10,
      enabledRotations: { x: false, y: true, z: false },
    }
  });
  chair.spawn(world, { x: x, y, z: z + 1 });
  
  // Create bookshelf
  const bookshelf = new Entity({
    name: 'Bookshelf',
    modelUri: 'models/furniture/storage/bookshelf.glb',
    modelScale: 0.8,
    rigidBodyOptions: {
      type: RigidBodyType.STATIC,
    }
  });
  bookshelf.spawn(world, { x: x + 3, y, z: z - 1 });
  
  // Create desk lamp with light
  const lamp = new Entity({
    name: 'Desk Lamp',
    modelUri: 'models/furniture/lamps/desk_lamp.glb',
    modelScale: 0.4,
    lightOptions: {
      type: 'point',
      color: { r: 1.0, g: 0.9, b: 0.7 },
      intensity: 0.8,
      range: 5,
      position: { x: 0, y: 0.5, z: 0 }
    }
  });
  lamp.spawn(world, { x: x + 0.5, y: y + 0.7, z: z - 0.3 });
  
  return {
    desk,
    chair,
    bookshelf,
    lamp
  };
}

// Usage in main game file:
// import { createOffice } from './furniture';
// 
// startServer(world => {
//   // Create Sherlock's office
//   const office = createOffice(world, { x: 5, y: 0, z: 5 });
// });
```

## Puzzle Trigger Example

```typescript
// puzzles.ts - Module for creating interactive puzzles
import { Entity, EntityEvent, PlayerEvent, World } from 'hytopia';

// Create a computer terminal puzzle
export function createTerminalPuzzle(world: World, position: {x: number, y: number, z: number}) {
  // Create terminal entity
  const terminal = new Entity({
    name: 'Computer Terminal',
    modelUri: 'models/props/terminal.glb',
    modelScale: 0.8,
    modelLoopedAnimations: ['idle_screen'],
  });
  
  // Track if the terminal has been activated
  let terminalActivated = false;
  
  // Make the terminal interactive
  terminal.on(EntityEvent.ENTITY_INTERACTION, ({ player }) => {
    if (!terminalActivated) {
      // Play activation animation
      terminal.stopModelAnimations(['idle_screen']);
      terminal.startModelOneshotAnimations(['boot_sequence']);
      
      // Show UI with puzzle
      player.ui.load('ui/puzzles/terminal_puzzle.html');
      
      // Track that this terminal has been activated
      terminalActivated = true;
      
      // Add to player's notebook
      const notebook = player.data.get('notebook_entries') || [];
      notebook.push({
        id: 'terminal_1',
        title: 'Mysterious Terminal',
        content: 'I found a computer terminal with strange symbols...',
        timestamp: Date.now()
      });
      player.data.set('notebook_entries', notebook);
    } else {
      // If already activated, just show the UI again
      player.ui.load('ui/puzzles/terminal_puzzle.html');
    }
  });
  
  // Set up UI message handler for all players
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    player.ui.onMessage((message) => {
      if (message.type === 'puzzleSolved' && message.puzzleId === 'terminal_1') {
        // Update game state
        const puzzlesSolved = player.data.get('puzzles_solved') || {};
        puzzlesSolved.terminal_1 = true;
        player.data.set('puzzles_solved', puzzlesSolved);
        
        // Update notebook with new information
        const notebook = player.data.get('notebook_entries') || [];
        const updatedNotebook = notebook.map(entry => {
          if (entry.id === 'terminal_1') {
            return {
              ...entry,
              content: entry.content + '\n\nI solved the sequence puzzle. The numbers were all prime numbers, and 13 was next in the sequence. This revealed information about Project S.I.N. - apparently it stands for "Sentient Intelligence Nexus".',
              updated: true
            };
          }
          return entry;
        });
        player.data.set('notebook_entries', updatedNotebook);
        
        // Notify player
        player.sendMessage('You\'ve unlocked new information in your notebook!');
      }
    });
  });
  
  // Spawn the terminal
  terminal.spawn(world, position);
  
  return terminal;
}

// Usage in main game file:
// import { createTerminalPuzzle } from './puzzles';
// 
// startServer(world => {
//   // Create terminal puzzle
//   const terminal = createTerminalPuzzle(world, { x: 10, y: 1, z: 15 });
// });
```

```html
<!-- assets/ui/puzzles/terminal_puzzle.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Courier New', monospace;
      background-color: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      overflow: hidden;
    }
    
    .terminal-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 800px;
      height: 70%;
      background-color: #000;
      border: 2px solid #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    
    .terminal-header {
      border-bottom: 1px solid #00ff00;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    .terminal-content {
      flex-grow: 1;
      overflow-y: auto;
    }
    
    .terminal-input {
      display: flex;
      margin-top: 20px;
    }
    
    .terminal-input-prompt {
      margin-right: 10px;
    }
    
    .terminal-input-field {
      flex-grow: 1;
      background: transparent;
      border: none;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      outline: none;
    }
    
    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: transparent;
      color: #00ff00;
      border: 1px solid #00ff00;
      cursor: pointer;
      padding: 5px 10px;
    }
    
    /* Blinking cursor effect */
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    
    .cursor {
      display: inline-block;
      width: 10px;
      height: 18px;
      background-color: #00ff00;
      animation: blink 1s infinite;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="terminal-container">
    <button class="close-button" id="closeButton">X</button>
    
    <div class="terminal-header">
      <h2>SYSTEM ACCESS TERMINAL</h2>
      <p>SIN-OS v2.1.4 // SECURITY CLEARANCE REQUIRED</p>
    </div>
    
    <div class="terminal-content" id="terminalContent">
      <p>> Initializing system...</p>
      <p>> Security protocols active</p>
      <p>> Please solve the following sequence to proceed:</p>
      <p>> 2, 3, 5, 7, 11, ?</p>
    </div>
    
    <div class="terminal-input">
      <div class="terminal-input-prompt">&gt;</div>
      <input type="text" class="terminal-input-field" id="terminalInput" autofocus>
      <div class="cursor"></div>
    </div>
  </div>
  
  <script>
    // Get references to DOM elements
    const terminalContent = document.getElementById('terminalContent');
    const terminalInput = document.getElementById('terminalInput');
    const closeButton = document.getElementById('closeButton');
    
    // The correct answer to the puzzle
    const correctAnswer = '13';
    
    // Handle input submission
    terminalInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const input = terminalInput.value.trim();
        
        // Add the input to the terminal content
        terminalContent.innerHTML += `<p>> ${input}</p>`;
        
        // Check if the answer is correct
        if (input === correctAnswer) {
          terminalContent.innerHTML += `<p>> CORRECT</p>`;
          terminalContent.innerHTML += `<p>> Access granted to Level 1 security files</p>`;
          terminalContent.innerHTML += `<p>> Decrypting data...</p>`;
          
          // Send message to game that puzzle is solved
          window.parent.postMessage({
            type: 'puzzleSolved',
            puzzleId: 'terminal_1'
          }, '*');
          
          // Clear input
          terminalInput.value = '';
          
          // Disable input after solving
          terminalInput.disabled = true;
        } else {
          terminalContent.innerHTML += `<p>> INCORRECT</p>`;
          terminalContent.innerHTML += `<p>> Please try again</p>`;
          
          // Clear input
          terminalInput.value = '';
        }
        
        // Scroll to bottom
        terminalContent.scrollTop = terminalContent.scrollHeight;
      }
    });
    
    // Handle close button
    closeButton.addEventListener('click', () => {
      // Send message to close UI
      window.parent.postMessage({
        type: 'closeUI'
      }, '*');
    });
  </script>
</body>
</html>
```

## Complete Game Integration

```typescript
// index.ts - Main game file with all features integrated
import { startServer, Entity, EntityEvent, PlayerEvent, PlayerEntity, RigidBodyType, World } from 'hytopia';
import { createOffice } from './furniture';
import { createTerminalPuzzle } from './puzzles';

startServer(world => {
  // Initialize world
  world.simulation.enableDebugRendering(false);
  
  // Set up player initialization
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    // Initialize player data
    initializePlayerData(player);
    
    // Set up UI message handler
    setupUIMessageHandler(player, world);
    
    // Create player entity with proper animations
    const playerEntity = new PlayerEntity({
      player,
      name: 'Sherlock',
      modelUri: 'models/characters/sherlock.glb',
      modelLoopedAnimations: ['idle'],
      modelScale: 0.5
    });
    
    // Implement custom character controller with proper animation handling
    class SherlockController extends BaseCharacterController {
      public tickPlayerMovement(inputState: PlayerInputState, orientationState: PlayerOrientationState, deltaTimeMs: number) {
        // Animation handling code (from avatar animation example)
        // ...
        
        // Call parent method for movement
        super.tickPlayerMovement(inputState, orientationState, deltaTimeMs);
      }
    }
    
    // Assign controller to player entity
    const controller = new SherlockController();
    playerEntity.setController(controller);
    
    // Spawn player in starting position
    playerEntity.spawn(world, { x: 0, y: 1, z: 0 });
    
    // Load UI with crosshair
    player.ui.load('ui/index.html');
    
    // Show welcome message and tutorial
    setTimeout(() => {
      player.ui.load('ui/intro/welcome.html');
    }, 2000);
  });
  
  // Create Sherlock's office environment
  const office = createOffice(world, { x: 5, y: 0, z: 5 });
  
  // Create terminal puzzle
  const terminal = createTerminalPuzzle(world, { x: 7, y: 1, z: 4 });
  
  // Create other puzzles and game elements
  // ...
});

// Initialize player data
function initializePlayerData(player) {
  // Set initial game state
  player.data.set('current_level', 1);
  player.data.set('puzzles_solved', {});
  player.data.set('notebook_entries', [
    {
      id: 'initial_entry',
      title: 'Strange Awakening',
      content: 'I woke up in my office, but something feels off. The technology around me seems... anachronistic. I need to investigate what\'s happening.',
      timestamp: Date.now(),
      category: 'observations'
    }
  ]);
}

// Set up UI message handler
function setupUIMessageHandler(player, world) {
  player.ui.onMessage((message) => {
    switch (message.type) {
      case 'puzzleSolved':
        // Puzzle solving logic
        // ...
        break;
        
      case 'closeUI':
        player.ui.close();
        break;
        
      case 'openNotebook':
        player.ui.load('ui/notebook/notebook.html');
        break;
        
      // Other message handlers
      // ...
    }
  });
}
```

These examples demonstrate how to implement the various technical solutions in your S.I.N. game project. You can adapt and extend them to fit your specific game requirements.
