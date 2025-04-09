# Development Blueprint: S.I.N. - Sentient Intelligence Nexus

## System Architecture Overview

The S.I.N. game is built using a modular component-based architecture on the Hytopia SDK. This blueprint breaks down the key systems into discrete components with clear responsibilities and interfaces.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      S.I.N. Game Architecture                   │
│                                                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│             │             │             │             │         │
│  Core Game  │   Entity    │   Puzzle    │     UI      │  Audio  │
│   Engine    │   System    │   System    │   System    │ System  │
│             │             │             │             │         │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────┤
│             │             │             │             │         │
│   Player    │     AI      │  Notebook   │    Level    │  Save   │
│   System    │   System    │   System    │   System    │ System  │
│             │             │             │             │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

## Component Breakdown

### 1. Core Game Engine

**Responsibility:** Manages the game loop, physics, rendering, and core Hytopia SDK integration.

**Key Components:**
- **GameManager**: Central controller for game state and systems
- **PhysicsController**: Handles collision detection and physics interactions
- **RenderManager**: Manages rendering and visual effects
- **InputHandler**: Processes player input and maps to game actions

**File Structure:**
```
/src
  /core
    GameManager.ts       # Main game loop and system coordination
    PhysicsController.ts # Physics and collision management
    RenderManager.ts     # Rendering pipeline management
    InputHandler.ts      # Input processing and mapping
    Constants.ts         # Game-wide constants and configuration
    Types.ts             # TypeScript type definitions
```

### 2. Entity System

**Responsibility:** Manages all game entities including players, NPCs, interactive objects, and environmental elements.

**Key Components:**
- **EntityManager**: Central registry for all entities
- **EntityFactory**: Creates entities from templates
- **EntityController**: Base class for entity behavior
- **InteractiveEntity**: Base class for objects players can interact with

**File Structure:**
```
/src
  /entities
    EntityManager.ts        # Entity registration and lifecycle
    EntityFactory.ts        # Entity creation and initialization
    EntityController.ts     # Base entity behavior
    InteractiveEntity.ts    # Base interactive object behavior
    /player
      PlayerEntity.ts       # Player-specific entity implementation
      PlayerController.ts   # Player movement and interaction
    /ai
      AIEntity.ts           # Base AI entity implementation
      AIController.ts       # AI behavior controller
    /props
      PropEntity.ts         # Static prop implementation
      InteractiveProp.ts    # Interactive prop implementation
    /puzzles
      PuzzleEntity.ts       # Base puzzle object implementation
```

### 3. Puzzle System

**Responsibility:** Manages puzzle creation, state, validation, and completion.

**Key Components:**
- **PuzzleManager**: Central registry for all puzzles
- **PuzzleFactory**: Creates puzzles from templates
- **PuzzleValidator**: Validates puzzle solutions
- **PuzzleUI**: Manages puzzle-specific UI elements

**File Structure:**
```
/src
  /puzzles
    PuzzleManager.ts      # Puzzle registration and state tracking
    PuzzleFactory.ts      # Puzzle creation and initialization
    PuzzleValidator.ts    # Solution validation logic
    PuzzleUI.ts           # Puzzle UI management
    /types
      SequencePuzzle.ts   # Sequence-based puzzles
      CodePuzzle.ts       # Code/cipher puzzles
      LogicPuzzle.ts      # Logic-based puzzles
      MemoryPuzzle.ts     # Memory-based puzzles
      TimedPuzzle.ts      # Time-constrained puzzles
```

### 4. UI System

**Responsibility:** Manages all user interface elements, HUD, menus, and interactive UI components.

**Key Components:**
- **UIManager**: Central controller for UI state and components
- **HUDController**: Manages heads-up display elements
- **MenuController**: Manages game menus
- **DialogueUI**: Manages dialogue interfaces
- **NotebookUI**: Manages the detective notebook interface

**File Structure:**
```
/src
  /ui
    UIManager.ts         # UI state and component management
    HUDController.ts     # HUD element management
    MenuController.ts    # Menu system management
    DialogueUI.ts        # Dialogue system UI
    NotebookUI.ts        # Notebook interface management
    CrosshairUI.ts       # Crosshair implementation
    /components
      Button.ts          # Button component
      Panel.ts           # Panel component
      TextDisplay.ts     # Text display component
      Inventory.ts       # Inventory UI component
    /screens
      MainMenu.ts        # Main menu screen
      PauseMenu.ts       # Pause menu screen
      SettingsMenu.ts    # Settings menu screen
```

### 5. Audio System

**Responsibility:** Manages all game audio including music, sound effects, and voice lines.

**Key Components:**
- **AudioManager**: Central controller for audio playback and state
- **MusicController**: Manages background music and transitions
- **SFXController**: Manages sound effects
- **VoiceController**: Manages voice line playback
- **AudioSpatializer**: Handles 3D audio positioning

**File Structure:**
```
/src
  /audio
    AudioManager.ts      # Audio system coordination
    MusicController.ts   # Music playback and transitions
    SFXController.ts     # Sound effect playback
    VoiceController.ts   # Voice line playback
    AudioSpatializer.ts  # 3D audio positioning
    /data
      AudioRegistry.ts   # Registry of all audio resources
```

### 6. Player System

**Responsibility:** Manages player state, inventory, abilities, and progression.

**Key Components:**
- **PlayerManager**: Central controller for player state
- **InventorySystem**: Manages player inventory
- **AbilitySystem**: Manages player abilities
- **ProgressionTracker**: Tracks player progression through the game

**File Structure:**
```
/src
  /player
    PlayerManager.ts       # Player state management
    InventorySystem.ts     # Inventory management
    AbilitySystem.ts       # Player ability management
    ProgressionTracker.ts  # Progression tracking
    PlayerAnimator.ts      # Player animation controller
    PlayerInput.ts         # Player input processing
```

### 7. AI System

**Responsibility:** Manages AI character behavior, dialogue, and interactions.

**Key Components:**
- **AIManager**: Central controller for AI entities
- **DialogueSystem**: Manages dialogue trees and interactions
- **AIBehaviorTree**: Implements AI decision making
- **AIPerceptionSystem**: Handles AI perception of the environment
- **AIPersonalitySystem**: Implements AI personality traits

**File Structure:**
```
/src
  /ai
    AIManager.ts           # AI system coordination
    DialogueSystem.ts      # Dialogue management
    AIBehaviorTree.ts      # AI decision making
    AIPerceptionSystem.ts  # Environment perception
    AIPersonalitySystem.ts # Personality implementation
    /characters
      Logic.ts             # LOGIC AI implementation
      Whimsy.ts            # WHIMSY AI implementation
      Guardian.ts          # GUARDIAN AI implementation
      Shadow.ts            # SHADOW AI implementation
      Echo.ts              # ECHO AI implementation
    /dialogue
      DialogueTree.ts      # Dialogue tree implementation
      DialogueNode.ts      # Dialogue node implementation
      ResponseOption.ts    # Response option implementation
```

### 8. Notebook System

**Responsibility:** Manages the detective notebook, clues, and case information.

**Key Components:**
- **NotebookManager**: Central controller for notebook content
- **ClueSystem**: Manages clue discovery and organization
- **CaseSystem**: Manages case information and connections
- **NotebookRenderer**: Renders notebook content in UI

**File Structure:**
```
/src
  /notebook
    NotebookManager.ts     # Notebook content management
    ClueSystem.ts          # Clue discovery and organization
    CaseSystem.ts          # Case information management
    NotebookRenderer.ts    # Notebook UI rendering
    /data
      ClueRegistry.ts      # Registry of all clues
      CaseRegistry.ts      # Registry of all cases
```

### 9. Level System

**Responsibility:** Manages level loading, transitions, and state.

**Key Components:**
- **LevelManager**: Central controller for level state
- **LevelLoader**: Handles level loading and unloading
- **TransitionSystem**: Manages level transitions
- **EnvironmentController**: Controls level-specific environmental effects

**File Structure:**
```
/src
  /levels
    LevelManager.ts          # Level state management
    LevelLoader.ts           # Level loading/unloading
    TransitionSystem.ts      # Level transition effects
    EnvironmentController.ts # Environmental effects
    /data
      LevelRegistry.ts       # Registry of all levels
    /levels
      Level0.ts              # Victorian Office implementation
      Level1.ts              # Digital Awakening implementation
      Level2.ts              # Neural Network implementation
      Level3.ts              # Data Processing implementation
      Level4.ts              # Consciousness Core implementation
      Level5.ts              # Reality Distortion implementation
      Level6.ts              # Truth Revelation implementation
      Level7.ts              # Simulation Exit implementation
```

### 10. Save System

**Responsibility:** Manages game saving, loading, and persistence.

**Key Components:**
- **SaveManager**: Central controller for save data
- **SaveSerializer**: Handles data serialization
- **SaveStorage**: Manages save file storage
- **AutosaveSystem**: Implements autosave functionality

**File Structure:**
```
/src
  /save
    SaveManager.ts       # Save data management
    SaveSerializer.ts    # Data serialization
    SaveStorage.ts       # Save file storage
    AutosaveSystem.ts    # Autosave implementation
```

## File and Module Structure

The complete file structure for the S.I.N. game project:

```
/sin-game
  /assets
    /models
      /characters        # Character models (.glb)
      /props             # Prop models (.glb)
      /furniture         # Furniture models (.glb)
      /effects           # Visual effect models (.glb)
    /textures
      /characters        # Character textures (.png)
      /props             # Prop textures (.png)
      /furniture         # Furniture textures (.png)
      /ui                # UI textures (.png)
      /environments      # Environment textures (.png)
    /audio
      /music             # Background music (.mp3)
      /sfx               # Sound effects (.wav)
      /voice             # Voice lines (.mp3)
      /ambient           # Ambient sounds (.mp3)
    /ui
      index.html         # Main UI HTML
      /css               # UI stylesheets
      /js                # UI scripts
      /puzzles           # Puzzle-specific UI
      /notebook          # Notebook UI
      /dialogue          # Dialogue UI
      /transitions       # Transition effects
  /src
    index.ts             # Main entry point
    /core                # Core game engine
    /entities            # Entity system
    /puzzles             # Puzzle system
    /ui                  # UI system
    /audio               # Audio system
    /player              # Player system
    /ai                  # AI system
    /notebook            # Notebook system
    /levels              # Level system
    /save                # Save system
    /utils               # Utility functions
  /config
    GameConfig.ts        # Game configuration
    AudioConfig.ts       # Audio configuration
    UIConfig.ts          # UI configuration
    InputConfig.ts       # Input configuration
    LevelConfig.ts       # Level configuration
  /docs
    API.md               # API documentation
    Architecture.md      # Architecture documentation
    AssetGuide.md        # Asset creation guide
    PuzzleDesign.md      # Puzzle design documentation
  package.json           # Project dependencies
  tsconfig.json          # TypeScript configuration
  README.md              # Project overview
```

## Asset Types and Expected Formats

### 3D Models
- **Format:** GLB/GLTF
- **Textures:** PNG (max 2048×2048)
- **Naming Convention:** lowercase_with_underscores.glb
- **Required Components:**
  - Characters: Mesh, materials, animations (idle, walk, run, interact)
  - Props: Mesh, materials, optional animations
  - Furniture: Mesh, materials, optional animations
  - Effects: Mesh, materials, animations

### Audio
- **Music Format:** MP3 (192kbps)
- **SFX Format:** WAV (16-bit, 44.1kHz)
- **Voice Format:** MP3 (256kbps)
- **Naming Convention:** category_description_variant.ext
- **Required Metadata:**
  - Loop points for music
  - Volume levels
  - Spatial audio properties

### Textures
- **Format:** PNG
- **Resolution:** 512×512, 1024×1024, or 2048×2048
- **Naming Convention:** object_type_variant.png
- **Required Maps:**
  - Diffuse/Albedo
  - Normal
  - Roughness
  - Metallic (where applicable)
  - Emissive (where applicable)

### UI Assets
- **Format:** PNG (UI elements), HTML/CSS/JS (UI screens)
- **Resolution:** Vector-based or 2x target resolution
- **Naming Convention:** ui_category_element_state.png
- **Required States:**
  - Normal
  - Hover
  - Pressed
  - Disabled

## Component Interaction Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  Game       │◄────►│  Level      │◄────►│  Entity     │
│  Manager    │      │  Manager    │      │  Manager    │
│             │      │             │      │             │
└─────┬───────┘      └──────┬──────┘      └──────┬──────┘
      │                     │                    │
      │                     │                    │
      │                     │                    │
      │                     │                    │
┌─────▼───────┐      ┌──────▼──────┐      ┌──────▼──────┐
│             │      │             │      │             │
│  UI         │◄────►│  Puzzle     │◄────►│  AI         │
│  Manager    │      │  Manager    │      │  Manager    │
│             │      │             │      │             │
└─────┬───────┘      └──────┬──────┘      └──────┬──────┘
      │                     │                    │
      │                     │                    │
      │                     │                    │
      │                     │                    │
┌─────▼───────┐      ┌──────▼──────┐      ┌──────▼──────┐
│             │      │             │      │             │
│  Player     │◄────►│  Notebook   │◄────►│  Audio      │
│  Manager    │      │  Manager    │      │  Manager    │
│             │      │             │      │             │
└─────┬───────┘      └─────────────┘      └─────────────┘
      │
      │
┌─────▼───────┐
│             │
│  Save       │
│  Manager    │
│             │
└─────────────┘
```

## Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  User       │────►│  Input      │────►│  Player     │
│  Input      │     │  Handler    │     │  Controller │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│             │     │             │     │              │
│  Renderer   │◄────┤  Game       │◄────┤  Entity      │
│             │     │  Manager    │     │  Manager     │
│             │     │             │     │              │
└─────────────┘     └──────┬──────┘     └──────┬───────┘
                           │                   │
                           │                   │
                           ▼                   ▼
┌─────────────┐     ┌──────────────┐    ┌──────────────┐
│             │     │              │    │              │
│  UI         │◄────┤  Puzzle      │◄───┤  AI          │
│  Manager    │     │  Manager     │    │  Manager     │
│             │     │              │    │              │
└──────┬──────┘     └──────────────┘    └──────────────┘
       │
       │
       ▼
┌─────────────┐     ┌─────────────┐
│             │     │             │
│  Notebook   │────►│  Save       │
│  Manager    │     │  Manager    │
│             │     │             │
└─────────────┘     └─────────────┘
```

## Key System Interfaces

### Entity System Interface

```typescript
interface IEntity {
  id: string;
  name: string;
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  modelUri: string;
  
  spawn(world: World, position: Vector3): void;
  despawn(): void;
  update(deltaTime: number): void;
  
  startModelAnimation(animationName: string): void;
  stopModelAnimation(animationName: string): void;
  
  setPosition(position: Vector3): void;
  setRotation(rotation: Quaternion): void;
  setScale(scale: Vector3): void;
  
  on(eventType: EntityEventType, callback: Function): void;
  off(eventType: EntityEventType, callback: Function): void;
  
  getComponent<T>(componentType: ComponentType): T | null;
  addComponent<T>(component: T): void;
  removeComponent<T>(componentType: ComponentType): void;
}
```

### Puzzle System Interface

```typescript
interface IPuzzle {
  id: string;
  type: PuzzleType;
  difficulty: PuzzleDifficulty;
  state: PuzzleState;
  
  initialize(): void;
  reset(): void;
  update(deltaTime: number): void;
  
  checkSolution(input: any): boolean;
  provideFeedback(input: any): PuzzleFeedback;
  provideHint(): string;
  
  onSolved(callback: Function): void;
  onFailed(callback: Function): void;
  
  showUI(player: Player): void;
  hideUI(player: Player): void;
}
```

### AI System Interface

```typescript
interface IAICharacter {
  id: string;
  name: string;
  personality: AIPersonality;
  trustLevel: number;
  deceptionLevel: number;
  
  initialize(): void;
  update(deltaTime: number): void;
  
  startDialogue(player: Player, context: DialogueContext): void;
  endDialogue(): void;
  
  getResponse(input: string, context: DialogueContext): DialogueResponse;
  updateTrustLevel(delta: number): void;
  updateDeceptionLevel(delta: number): void;
  
  getKnowledge(topic: string): string | null;
  hasKnowledge(topic: string): boolean;
  addKnowledge(topic: string, information: string): void;
}
```

### Notebook System Interface

```typescript
interface INotebook {
  entries: NotebookEntry[];
  categories: NotebookCategory[];
  
  initialize(): void;
  
  addEntry(entry: NotebookEntry): void;
  updateEntry(entryId: string, updates: Partial<NotebookEntry>): void;
  removeEntry(entryId: string): void;
  
  getEntry(entryId: string): NotebookEntry | null;
  getEntriesByCategory(category: NotebookCategory): NotebookEntry[];
  
  addCategory(category: NotebookCategory): void;
  removeCategory(categoryId: string): void;
  
  showUI(player: Player): void;
  hideUI(player: Player): void;
}
```

This development blueprint provides a comprehensive breakdown of the S.I.N. game architecture, component structure, file organization, and system interfaces. It serves as a technical roadmap for implementing the game, ensuring all systems are properly designed and integrated.
