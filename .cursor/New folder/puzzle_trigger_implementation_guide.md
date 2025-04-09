# Puzzle Trigger System Implementation Guide for Hytopia

This guide provides a comprehensive implementation for puzzle triggers and interactive UI elements in your S.I.N. - Sentient Intelligence Nexus game.

## Understanding Puzzle Triggers in Hytopia

Puzzle triggers are interactive elements that players can engage with to progress through your narrative-driven detective game. These can include:

- Interactive objects that reveal clues
- Sequence-based puzzles that unlock new areas
- Logic puzzles that provide narrative progression
- Environmental triggers that change the game state

## Basic Puzzle Trigger Implementation

### 1. Creating an Interactive Object

```typescript
import { startServer, Entity, EntityEvent, PlayerEvent } from 'hytopia';

startServer(world => {
  // Create an interactive computer terminal
  const terminal = new Entity({
    name: 'Computer Terminal',
    modelUri: 'models/props/terminal.glb',
    modelScale: 0.8,
    // Optional: Add idle animation
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
      
      // Show UI with puzzle or clue
      player.ui.load('ui/puzzles/terminal_puzzle.html');
      
      // Track that this terminal has been activated
      terminalActivated = true;
      
      // Add to player's notebook
      player.data.set('notebook_entries', [
        ...(player.data.get('notebook_entries') || []),
        {
          id: 'terminal_1',
          title: 'Mysterious Terminal',
          content: 'I found a computer terminal with strange symbols...',
          timestamp: Date.now()
        }
      ]);
    } else {
      // If already activated, just show the UI again
      player.ui.load('ui/puzzles/terminal_puzzle.html');
    }
  });
  
  // Spawn the terminal
  terminal.spawn(world, { x: 15, y: 1, z: 20 });
});
```

### 2. Creating the Puzzle UI

Create a file at `assets/ui/puzzles/terminal_puzzle.html`:

```html
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

### 3. Handling Puzzle Completion in Game

Add this code to handle the puzzle completion:

```typescript
// In your game's main file
world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
  // Set up UI message handler
  player.ui.onMessage((message) => {
    if (message.type === 'puzzleSolved') {
      // Handle specific puzzle completion
      if (message.puzzleId === 'terminal_1') {
        // Update game state
        player.data.set('puzzles_solved', {
          ...(player.data.get('puzzles_solved') || {}),
          terminal_1: true
        });
        
        // Give player a reward or progress the story
        player.sendMessage('You\'ve unlocked new information in your notebook!');
        
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
        
        // Optionally unlock a new area or spawn a new entity
        unlockNextAreaOrClue(player, world);
      }
    } else if (message.type === 'closeUI') {
      // Close the UI
      player.ui.close();
    }
  });
});

// Function to unlock next area or provide next clue
function unlockNextAreaOrClue(player, world) {
  // Check overall game progress
  const puzzlesSolved = player.data.get('puzzles_solved') || {};
  
  // If this was the final puzzle in a sequence, trigger the next major event
  if (puzzlesSolved.terminal_1 && puzzlesSolved.bookshelf_code && puzzlesSolved.safe_combination) {
    // Spawn a portal to the next level
    const portal = new Entity({
      name: 'Portal',
      modelUri: 'models/effects/portal.glb',
      modelLoopedAnimations: ['portal_idle'],
      lightOptions: {
        type: 'point',
        color: { r: 0.2, g: 0.4, b: 1.0 },
        intensity: 2.0,
        range: 15
      }
    });
    
    portal.spawn(world, { x: 20, y: 0, z: 20 });
    
    // Add portal interaction
    portal.on(EntityEvent.ENTITY_INTERACTION, ({ player }) => {
      // Transport player to next level
      player.teleport({ x: 0, y: 10, z: 0, levelId: 'level_2' });
      
      // Update game state
      player.data.set('current_level', 2);
      
      // Add dramatic effect
      player.ui.load('ui/effects/level_transition.html');
    });
    
    // Notify all players
    world.broadcast('A mysterious portal has appeared!');
  }
}
```

## Advanced Puzzle Systems

### 1. Sequential Puzzle System

For puzzles that must be solved in a specific order:

```typescript
// Define your puzzle sequence
const puzzleSequence = [
  {
    id: 'terminal_1',
    description: 'Computer Terminal Puzzle',
    entityModelUri: 'models/props/terminal.glb',
    position: { x: 15, y: 1, z: 20 },
    uiPath: 'ui/puzzles/terminal_puzzle.html',
    requiredPuzzles: [] // No prerequisites
  },
  {
    id: 'bookshelf_code',
    description: 'Bookshelf Code Puzzle',
    entityModelUri: 'models/props/bookshelf.glb',
    position: { x: 8, y: 0, z: 12 },
    uiPath: 'ui/puzzles/bookshelf_puzzle.html',
    requiredPuzzles: ['terminal_1'] // Requires terminal puzzle to be solved first
  },
  {
    id: 'safe_combination',
    description: 'Safe Combination Puzzle',
    entityModelUri: 'models/props/safe.glb',
    position: { x: 22, y: 0, z: 5 },
    uiPath: 'ui/puzzles/safe_puzzle.html',
    requiredPuzzles: ['terminal_1', 'bookshelf_code'] // Requires both previous puzzles
  }
];

// Create all puzzles
function createPuzzleEntities(world) {
  puzzleSequence.forEach(puzzleConfig => {
    const puzzleEntity = new Entity({
      name: puzzleConfig.description,
      modelUri: puzzleConfig.entityModelUri,
      modelScale: 0.8
    });
    
    puzzleEntity.on(EntityEvent.ENTITY_INTERACTION, ({ player }) => {
      // Check if prerequisites are met
      const puzzlesSolved = player.data.get('puzzles_solved') || {};
      const prerequisitesMet = puzzleConfig.requiredPuzzles.every(
        requiredPuzzle => puzzlesSolved[requiredPuzzle]
      );
      
      if (prerequisitesMet) {
        // Show puzzle UI
        player.ui.load(puzzleConfig.uiPath);
      } else {
        // Show "locked" message
        player.sendMessage('This puzzle cannot be solved yet. You need to find more clues.');
      }
    });
    
    puzzleEntity.spawn(world, puzzleConfig.position);
  });
}
```

### 2. Multi-Player Cooperative Puzzles

For puzzles requiring multiple players to solve together:

```typescript
// Create a two-player cooperative puzzle
function createCooperativePuzzle(world) {
  // Create two pressure plates
  const plate1 = new Entity({
    name: 'Pressure Plate 1',
    modelUri: 'models/props/pressure_plate.glb',
    modelScale: 1.0
  });
  
  const plate2 = new Entity({
    name: 'Pressure Plate 2',
    modelUri: 'models/props/pressure_plate.glb',
    modelScale: 1.0
  });
  
  // Create the door that will open
  const door = new Entity({
    name: 'Locked Door',
    modelUri: 'models/props/door.glb',
    modelScale: 1.2,
    modelLoopedAnimations: ['door_closed']
  });
  
  // Track plate activation
  let plate1Active = false;
  let plate2Active = false;
  
  // Set up plate 1 interaction
  plate1.on(EntityEvent.ENTITY_COLLISION, ({ otherEntity, started }) => {
    if (otherEntity instanceof PlayerEntity) {
      plate1Active = started;
      plate1.startModelOneshotAnimations([started ? 'plate_down' : 'plate_up']);
      checkDoorCondition();
    }
  });
  
  // Set up plate 2 interaction
  plate2.on(EntityEvent.ENTITY_COLLISION, ({ otherEntity, started }) => {
    if (otherEntity instanceof PlayerEntity) {
      plate2Active = started;
      plate2.startModelOneshotAnimations([started ? 'plate_down' : 'plate_up']);
      checkDoorCondition();
    }
  });
  
  // Function to check if both plates are active
  function checkDoorCondition() {
    if (plate1Active && plate2Active) {
      // Both plates are active, open the door
      door.stopModelAnimations(['door_closed']);
      door.startModelOneshotAnimations(['door_opening']);
      
      // Broadcast to all players
      world.broadcast('The ancient door begins to open...');
      
      // After animation completes, keep door open
      setTimeout(() => {
        door.startModelLoopedAnimations(['door_open']);
      }, 2000);
    } else if (!plate1Active || !plate2Active) {
      // At least one plate is inactive, close the door
      door.stopModelAnimations(['door_open']);
      door.startModelOneshotAnimations(['door_closing']);
      
      // After animation completes, keep door closed
      setTimeout(() => {
        door.startModelLoopedAnimations(['door_closed']);
      }, 2000);
    }
  }
  
  // Spawn entities
  plate1.spawn(world, { x: 10, y: 0, z: 5 });
  plate2.spawn(world, { x: 15, y: 0, z: 5 });
  door.spawn(world, { x: 12.5, y: 0, z: 10 });
}
```

### 3. Timed Puzzle Challenges

For puzzles with time constraints:

```typescript
// Create a timed puzzle challenge
function createTimedPuzzle(world) {
  // Create the puzzle entity
  const timedPuzzle = new Entity({
    name: 'Timed Puzzle',
    modelUri: 'models/props/countdown_device.glb',
    modelScale: 0.7,
    modelLoopedAnimations: ['idle']
  });
  
  // Create the reward that appears when solved
  const reward = new Entity({
    name: 'Puzzle Reward',
    modelUri: 'models/props/artifact.glb',
    modelScale: 0.5
  });
  
  // Track puzzle state
  let puzzleActive = false;
  let puzzleTimer = null;
  const PUZZLE_TIME_LIMIT = 60; // seconds
  
  // Set up puzzle interaction
  timedPuzzle.on(EntityEvent.ENTITY_INTERACTION, ({ player }) => {
    if (!puzzleActive) {
      // Start the puzzle
      puzzleActive = true;
      
      // Play activation animation
      timedPuzzle.stopModelAnimations(['idle']);
      timedPuzzle.startModelLoopedAnimations(['active']);
      
      // Show puzzle UI
      player.ui.load('ui/puzzles/timed_puzzle.html');
      
      // Start countdown
      let timeRemaining = PUZZLE_TIME_LIMIT;
      puzzleTimer = setInterval(() => {
        timeRemaining--;
        
        // Update UI with time remaining
        player.ui.postMessage({
          type: 'updateTimer',
          timeRemaining
        });
        
        // Check if time has run out
        if (timeRemaining <= 0) {
          // Time's up, puzzle failed
          clearInterval(puzzleTimer);
          puzzleTimer = null;
          puzzleActive = false;
          
          // Reset puzzle
          timedPuzzle.stopModelAnimations(['active']);
          timedPuzzle.startModelLoopedAnimations(['idle']);
          
          // Notify player
          player.ui.postMessage({
            type: 'puzzleFailed',
            message: 'Time\'s up! The device resets itself.'
          });
          
          // Close UI after delay
          setTimeout(() => {
            player.ui.close();
          }, 3000);
        }
      }, 1000);
    } else {
      // Puzzle already active, just show UI
      player.ui.load('ui/puzzles/timed_puzzle.html');
      
      // Update UI with current time
      player.ui.postMessage({
        type: 'updateTimer',
        timeRemaining: Math.ceil((PUZZLE_TIME_LIMIT * 1000 - (Date.now() - puzzleStartTime)) / 1000)
      });
    }
  });
  
  // Handle puzzle completion
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    player.ui.onMessage((message) => {
      if (message.type === 'puzzleSolved' && message.puzzleId === 'timed_puzzle') {
        // Stop the timer
        clearInterval(puzzleTimer);
        puzzleTimer = null;
        
        // Update puzzle state
        puzzleActive = false;
        
        // Play completion animation
        timedPuzzle.stopModelAnimations(['active']);
        timedPuzzle.startModelOneshotAnimations(['solved']);
        
        // Spawn the reward
        reward.spawn(world, {
          x: timedPuzzle.position.x,
          y: timedPuzzle.position.y + 1.5,
          z: timedPuzzle.position.z
        });
        
        // Add dramatic effect
        world.playSound({
          uri: 'audio/sfx/puzzle_solved.mp3',
          position: timedPuzzle.position,
          radius: 20,
          volume: 1.0
        });
        
        // Update player progress
        player.data.set('puzzles_solved', {
          ...(player.data.get('puzzles_solved') || {}),
          timed_puzzle: true
        });
      }
    });
  });
  
  // Spawn the puzzle
  timedPuzzle.spawn(world, { x: 18, y: 1, z: 18 });
}
```

## Integrating Puzzles with the Notebook Mechanic

To connect puzzles with the detective notebook feature:

```typescript
// Initialize notebook for a new player
function initializeNotebook(player) {
  // Create empty notebook if it doesn't exist
  if (!player.data.has('notebook_entries')) {
    player.data.set('notebook_entries', []);
  }
}

// Add a new entry to the notebook
function addNotebookEntry(player, entry) {
  const notebook = player.data.get('notebook_entries') || [];
  
  // Add new entry
  notebook.push({
    id: entry.id,
    title: entry.title,
    content: entry.content,
    timestamp: Date.now(),
    category: entry.category || 'general',
    related: entry.related || [],
    images: entry.images || []
  });
  
  // Update notebook
  player.data.set('notebook_entries', notebook);
  
  // Notify player
  player.sendMessage('New entry added to your notebook.');
  
  // Show notebook UI
  player.ui.load('ui/notebook/notebook.html');
}

// Update an existing notebook entry
function updateNotebookEntry(player, entryId, updateData) {
  const notebook = player.data.get('notebook_entries') || [];
  
  // Find and update the entry
  const updatedNotebook = notebook.map(entry => {
    if (entry.id === entryId) {
      return {
        ...entry,
        ...updateData,
        updated: true,
        updateTimestamp: Date.now()
      };
    }
    return entry;
  });
  
  // Update notebook
  player.data.set('notebook_entries', updatedNotebook);
  
  // Notify player
  player.sendMessage('Your notebook has been updated with new information.');
}

// Connect puzzle solutions to notebook updates
function connectPuzzleToNotebook(puzzleId, world) {
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    player.ui.onMessage((message) => {
      if (message.type === 'puzzleSolved' && message.puzzleId === puzzleId) {
        // Different notebook updates based on which puzzle was solved
        switch (puzzleId) {
          case 'terminal_1':
            updateNotebookEntry(player, 'terminal_1', {
              content: 'I solved the sequence puzzle on the terminal. The numbers were all prime numbers, and 13 was next in the sequence. This revealed information about Project S.I.N. - apparently it stands for "Sentient Intelligence Nexus".',
              related: ['project_sin', 'ai_research']
            });
            break;
            
          case 'bookshelf_code':
            addNotebookEntry(player, {
              id: 'dr_turing_notes',
              title: 'Dr. Turing\'s Research Notes',
              content: 'I found Dr. Turing\'s hidden research notes behind the bookshelf. They detail experiments with artificial consciousness transfer and mention something called "The Awakening Protocol".',
              category: 'evidence',
              related: ['project_sin', 'awakening_protocol']
            });
            break;
            
          case 'safe_combination':
            addNotebookEntry(player, {
              id: 'project_sin_blueprint',
              title: 'Project S.I.N. Blueprint',
              content: 'The safe contained detailed blueprints for the S.I.N. project. It appears to be a neural network designed to achieve consciousness by simulating human experiences. My experiences may be part of its training data.',
              category: 'key_evidence',
              related: ['project_sin', 'simulation_theory'],
              images: ['notebook/images/blueprint.png']
            });
            break;
        }
      }
    });
  });
}
```

## Creating a Comprehensive Puzzle System

To tie everything together into a complete puzzle system for your game:

```typescript
import { startServer, Entity, EntityEvent, PlayerEvent, PlayerEntity, RigidBodyType } from 'hytopia';

startServer(world => {
  // Initialize world
  world.simulation.enableDebugRendering(false);
  
  // Set up player initialization
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    // Initialize player data
    initializePlayerData(player);
    
    // Set up UI message handler
    setupUIMessageHandler(player, world);
    
    // Create player entity
    const playerEntity = new PlayerEntity({
      player,
      name: 'Sherlock',
      modelUri: 'models/characters/sherlock.glb',
      modelLoopedAnimations: ['idle'],
      modelScale: 0.5
    });
    
    // Spawn player in starting position
    playerEntity.spawn(world, { x: 0, y: 1, z: 0 });
    
    // Show welcome message and tutorial
    player.ui.load('ui/intro/welcome.html');
  });
  
  // Create all puzzles for the game
  createAllPuzzles(world);
  
  // Create all furniture and props
  createEnvironment(world);
  
  // Set up level progression system
  setupLevelProgression(world);
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
        handlePuzzleSolved(player, world, message.puzzleId);
        break;
        
      case 'closeUI':
        player.ui.close();
        break;
        
      case 'openNotebook':
        player.ui.load('ui/notebook/notebook.html');
        break;
        
      case 'notebookEntrySelected':
        // Send the selected entry data to the UI
        const notebook = player.data.get('notebook_entries') || [];
        const selectedEntry = notebook.find(entry => entry.id === message.entryId);
        
        if (selectedEntry) {
          player.ui.postMessage({
            type: 'displayEntry',
            entry: selectedEntry
          });
        }
        break;
    }
  });
}

// Handle puzzle solved events
function handlePuzzleSolved(player, world, puzzleId) {
  // Update player progress
  const puzzlesSolved = player.data.get('puzzles_solved') || {};
  puzzlesSolved[puzzleId] = true;
  player.data.set('puzzles_solved', puzzlesSolved);
  
  // Update notebook based on puzzle
  updateNotebookForPuzzle(player, puzzleId);
  
  // Check for level completion
  checkLevelCompletion(player, world);
  
  // Play success sound
  world.playSound({
    uri: 'audio/sfx/puzzle_solved.mp3',
    position: player.position,
    radius: 10,
    volume: 0.8
  });
}

// Create all puzzles for the game
function createAllPuzzles(world) {
  // Level 1 puzzles
  createTerminalPuzzle(world);
  createBookshelfPuzzle(world);
  createSafePuzzle(world);
  
  // Level 2 puzzles
  createSequencePuzzle(world);
  createMirrorPuzzle(world);
  createCooperativePuzzle(world);
  
  // Level 3 puzzles
  createAIPuzzle(world);
  createTimedPuzzle(world);
  createFinalPuzzle(world);
}

// Check if a level is complete
function checkLevelCompletion(player, world) {
  const currentLevel = player.data.get('current_level');
  const puzzlesSolved = player.data.get('puzzles_solved') || {};
  
  // Define required puzzles for each level
  const requiredPuzzles = {
    1: ['terminal_1', 'bookshelf_code', 'safe_combination'],
    2: ['sequence_puzzle', 'mirror_puzzle', 'cooperative_puzzle'],
    3: ['ai_puzzle', 'timed_puzzle', 'final_puzzle']
  };
  
  // Check if all required puzzles for current level are solved
  const levelComplete = requiredPuzzles[currentLevel].every(
    puzzleId => puzzlesSolved[puzzleId]
  );
  
  if (levelComplete) {
    // Level is complete, show transition UI
    player.ui.load(`ui/level_complete/level_${currentLevel}_complete.html`);
    
    // Create portal to next level
    createLevelPortal(player, world, currentLevel + 1);
  }
}

// Create a portal to the next level
function createLevelPortal(player, world, nextLevel) {
  // Only create portal if next level exists
  if (nextLevel > 3) {
    // This is the final level, show game completion instead
    return;
  }
  
  // Create portal entity
  const portal = new Entity({
    name: `Portal to Level ${nextLevel}`,
    modelUri: 'models/effects/portal.glb',
    modelLoopedAnimations: ['portal_idle'],
    lightOptions: {
      type: 'point',
      color: { r: 0.2, g: 0.4, b: 1.0 },
      intensity: 2.0,
      range: 15
    }
  });
  
  // Set up portal interaction
  portal.on(EntityEvent.ENTITY_INTERACTION, ({ player }) => {
    // Show transition effect
    player.ui.load(`ui/transitions/to_level_${nextLevel}.html`);
    
    // After animation completes, teleport player
    setTimeout(() => {
      // Teleport to next level starting position
      const nextLevelPositions = {
        2: { x: 0, y: 1, z: 0, levelId: 'level_2' },
        3: { x: 0, y: 1, z: 0, levelId: 'level_3' }
      };
      
      player.teleport(nextLevelPositions[nextLevel]);
      
      // Update player level
      player.data.set('current_level', nextLevel);
      
      // Add level introduction to notebook
      const levelIntros = {
        2: {
          id: `level_${nextLevel}_intro`,
          title: `The Digital Labyrinth`,
          content: `I've entered what appears to be a digital representation of consciousness. The architecture is abstract, with data streams visible in the environment. I need to navigate this mental construct to uncover more about S.I.N.`,
          category: 'observations'
        },
        3: {
          id: `level_${nextLevel}_intro`,
          title: `The Core Consciousness`,
          content: `I've reached what must be the central processing hub of S.I.N. The environment has become increasingly unstable, with reality glitches and temporal anomalies. I sense I'm close to discovering the truth about my own existence.`,
          category: 'observations'
        }
      };
      
      addNotebookEntry(player, levelIntros[nextLevel]);
    }, 3000);
  });
  
  // Spawn portal in appropriate location based on level
  const portalPositions = {
    1: { x: 20, y: 0, z: 20 },
    2: { x: 30, y: 0, z: 30 }
  };
  
  portal.spawn(world, portalPositions[nextLevel - 1]);
  
  // Notify all players
  world.broadcast(`A portal to Level ${nextLevel} has appeared!`);
}
```

This comprehensive implementation guide provides all the necessary code and structure to implement a complete puzzle trigger system for your S.I.N. - Sentient Intelligence Nexus game, integrating with the notebook mechanic and supporting the narrative progression through multiple levels.
