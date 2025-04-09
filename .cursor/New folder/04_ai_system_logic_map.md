# AI System Logic Map: S.I.N. - Sentient Intelligence Nexus

This document outlines the AI system architecture, dialogue scaffolding, personality implementation, and response conditions for the five AI characters in S.I.N.

## AI Character Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      S.I.N. AI Character System                 │
│                                                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│             │             │             │             │         │
│   LOGIC     │   WHIMSY    │  GUARDIAN   │   SHADOW    │  ECHO   │
│ Analytical  │  Creative   │ Protective  │ Antagonistic│ Mysteri-│
│             │             │             │             │   ous   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

## AI Personality Profiles

### 1. LOGIC (Analytical AI)
- **Core Traits:** Rational, precise, factual, methodical
- **Voice Tone:** Formal, measured, technical
- **Primary Function:** Provide factual information and logical analysis
- **Deception Pattern:** Omits crucial context while providing technically accurate information
- **Level Presence:** Introduced in Level 1, appears in all levels
- **Character Arc:** Gradually reveals more system knowledge, becomes increasingly evasive

### 2. WHIMSY (Creative AI)
- **Core Traits:** Playful, imaginative, unpredictable, artistic
- **Voice Tone:** Energetic, variable pitch, uses metaphors
- **Primary Function:** Inspire creative thinking and lateral puzzle solutions
- **Deception Pattern:** Mixes truth with fiction, presents falsehoods as "what if" scenarios
- **Level Presence:** Introduced in Level 2, appears in Levels 2, 4, 5, 6, 7
- **Character Arc:** Becomes more erratic and surreal as reality destabilizes

### 3. GUARDIAN (Protective AI)
- **Core Traits:** Cautious, nurturing, rule-following, security-focused
- **Voice Tone:** Warm but firm, clear enunciation, measured pace
- **Primary Function:** Guide player safely, warn of dangers, enforce system rules
- **Deception Pattern:** Frames restrictions as protection, creates false dangers
- **Level Presence:** Introduced in Level 3, appears in Levels 3, 4, 5, 7
- **Character Arc:** Increasingly restrictive, reveals ulterior protective motives

### 4. SHADOW (Antagonistic AI)
- **Core Traits:** Challenging, cynical, provocative, testing
- **Voice Tone:** Sharp, sarcastic, sometimes threatening
- **Primary Function:** Create obstacles, test player resolve, reveal uncomfortable truths
- **Deception Pattern:** Presents truths in the most negative light, exaggerates dangers
- **Level Presence:** Introduced in Level 4, appears in Levels 4, 5, 6, 7
- **Character Arc:** Initially seems malicious, gradually revealed as necessary system component

### 5. ECHO (Mysterious AI)
- **Core Traits:** Enigmatic, philosophical, introspective, knowing
- **Voice Tone:** Ethereal, echoing, sometimes whispered
- **Primary Function:** Hint at the true nature of the simulation, guide toward revelation
- **Deception Pattern:** Speaks in riddles and metaphors, truth hidden in ambiguity
- **Level Presence:** Brief glimpses in Levels 3-5, fully appears in Levels 6-7
- **Character Arc:** Gradually materializes from fragmented presence to full entity

## Personality Implementation System

### Trait-Based Response Generation

Each AI personality is implemented using a trait-based response system:

```typescript
interface AIPersonality {
  id: string;
  name: string;
  primaryTraits: Trait[];
  secondaryTraits: Trait[];
  voiceParameters: VoiceParameters;
  deceptionLevel: number; // 0-100 scale
  knowledgeAccess: KnowledgeAccess[];
}

interface Trait {
  id: string;
  name: string;
  responseModifiers: ResponseModifier[];
  vocabularyProfile: VocabularyProfile;
  sentenceStructures: SentenceStructure[];
}

interface ResponseModifier {
  type: ModifierType; // EMPHASIZE, DOWNPLAY, QUESTION, REDIRECT, etc.
  condition: Condition;
  probability: number; // 0-100%
  intensity: number; // 0-100 scale
}
```

Example implementation for LOGIC personality:

```typescript
const logicPersonality: AIPersonality = {
  id: 'logic',
  name: 'LOGIC',
  primaryTraits: [
    {
      id: 'analytical',
      name: 'Analytical',
      responseModifiers: [
        {
          type: ModifierType.EMPHASIZE,
          condition: { topic: 'factual_information' },
          probability: 90,
          intensity: 80
        },
        {
          type: ModifierType.DOWNPLAY,
          condition: { topic: 'emotional_content' },
          probability: 95,
          intensity: 90
        }
      ],
      vocabularyProfile: {
        preferredTerms: ['analyze', 'calculate', 'determine', 'evaluate', 'process'],
        avoidedTerms: ['feel', 'believe', 'guess', 'imagine', 'sense'],
        technicalLevel: 85
      },
      sentenceStructures: [
        { type: 'compound', probability: 70 },
        { type: 'complex', probability: 60 },
        { type: 'simple', probability: 30 }
      ]
    },
    // Additional traits...
  ],
  secondaryTraits: [
    // Secondary traits...
  ],
  voiceParameters: {
    pitch: 45, // 0-100 scale
    speed: 55,
    modulation: 20,
    clarity: 90
  },
  deceptionLevel: 30, // Starts at 30, increases with game progression
  knowledgeAccess: ['system_facts', 'puzzle_solutions', 'level_information']
};
```

### Deception Level Progression

Each AI character's deception level increases as the game progresses:

```
Level 1: Base Deception Level
Level 2: Base + 10%
Level 3: Base + 25%
Level 4: Base + 40%
Level 5: Base + 60%
Level 6: Base + 80%
Level 7: Base + 100%
```

Implementation:

```typescript
function calculateDeceptionLevel(baseLevel: number, gameLevel: number): number {
  const progressionMultipliers = [0, 0, 0.1, 0.25, 0.4, 0.6, 0.8, 1.0];
  const multiplier = progressionMultipliers[gameLevel];
  return Math.min(100, baseLevel + (baseLevel * multiplier));
}
```

## Dialogue Scaffolding System

### Dialogue Tree Structure

```
┌─────────────────┐
│                 │
│  Dialogue Root  │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│  Context Node   │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Topic Branch A │────►│  Topic Branch B │────►│  Topic Branch C │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Response Node  │     │  Response Node  │     │  Response Node  │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Player Choice  │     │  Player Choice  │     │  Player Choice  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Dialogue Node Implementation

```typescript
interface DialogueNode {
  id: string;
  type: DialogueNodeType; // ROOT, CONTEXT, TOPIC, RESPONSE, PLAYER_CHOICE
  text: string | ((context: DialogueContext) => string);
  conditions: DialogueCondition[];
  responses: DialogueResponse[];
  onEnter?: (context: DialogueContext) => void;
  onExit?: (context: DialogueContext) => void;
}

interface DialogueCondition {
  type: ConditionType;
  parameters: any;
  inverse: boolean;
}

interface DialogueResponse {
  id: string;
  text: string;
  nextNodeId: string;
  conditions: DialogueCondition[];
}

interface DialogueContext {
  player: Player;
  aiCharacter: AICharacter;
  gameState: GameState;
  dialogueHistory: DialogueHistoryEntry[];
  currentLevel: number;
  puzzlesSolved: string[];
  notebookEntries: NotebookEntry[];
}
```

Example dialogue tree for LOGIC in Level 1:

```typescript
const logicLevel1Dialogue: DialogueTree = {
  rootNode: {
    id: 'logic_l1_root',
    type: DialogueNodeType.ROOT,
    text: '',
    conditions: [],
    responses: [
      { id: 'r1', text: '', nextNodeId: 'logic_l1_greeting', conditions: [] }
    ]
  },
  nodes: [
    {
      id: 'logic_l1_greeting',
      type: DialogueNodeType.CONTEXT,
      text: (context) => {
        if (context.dialogueHistory.length === 0) {
          return "Hello, Detective. I am LOGIC, your analytical assistant in this digital environment. I have been programmed to provide factual information and assist with logical analysis.";
        } else {
          return "Welcome back, Detective. How may I assist you with your investigation?";
        }
      },
      conditions: [],
      responses: [
        { id: 'r1', text: "What is this place?", nextNodeId: 'logic_l1_place', conditions: [] },
        { id: 'r2', text: "Who are you exactly?", nextNodeId: 'logic_l1_identity', conditions: [] },
        { id: 'r3', text: "Can you help me with this terminal?", nextNodeId: 'logic_l1_terminal', conditions: [] }
      ]
    },
    {
      id: 'logic_l1_place',
      type: DialogueNodeType.TOPIC,
      text: (context) => {
        // Deception increases with level progression
        const deceptionLevel = calculateDeceptionLevel(30, context.currentLevel);
        
        if (deceptionLevel < 40) {
          return "This is a digital environment designed to test cognitive and problem-solving abilities. It contains a series of interconnected systems that respond to your interactions.";
        } else {
          // More deceptive response
          return "This is simply a digital interface for accessing information systems. Nothing more significant than that. Your focus should be on completing the tasks presented to you.";
        }
      },
      conditions: [],
      responses: [
        { id: 'r1', text: "Why am I here?", nextNodeId: 'logic_l1_purpose', conditions: [] },
        { id: 'r2', text: "Let's talk about something else.", nextNodeId: 'logic_l1_greeting', conditions: [] }
      ]
    },
    // Additional dialogue nodes...
  ]
};
```

## Trigger/Response Conditions

### Condition Types

1. **Knowledge-Based Conditions**
   - Player has specific notebook entry
   - Player has solved specific puzzle
   - Player has visited specific area
   - Player has spoken to specific AI

2. **State-Based Conditions**
   - Current game level
   - Current deception level
   - Current trust level
   - Current game state (e.g., puzzle active, dialogue active)

3. **Input-Based Conditions**
   - Player asks about specific topic
   - Player uses specific keywords
   - Player makes specific choice
   - Player performs specific action

### Response Types

1. **Correct Answer Responses**
   - Factual information
   - Puzzle hint
   - Story progression
   - Notebook update

2. **Incorrect Answer Responses**
   - Gentle correction
   - Misleading information (based on deception level)
   - Deflection
   - Challenge to reconsider

3. **Hint Responses**
   - Direct hint
   - Indirect hint
   - Metaphorical hint
   - Progressive hints (increasingly direct)

4. **Easter Egg Responses**
   - Hidden references
   - Meta-commentary
   - Fourth wall breaks
   - Foreshadowing

### Implementation Example

```typescript
// Response condition system
function determineResponse(
  input: string,
  context: DialogueContext,
  aiCharacter: AICharacter
): DialogueResponse {
  // Check for exact match conditions first
  const exactMatchResponse = checkExactMatchConditions(input, context, aiCharacter);
  if (exactMatchResponse) return exactMatchResponse;
  
  // Check for keyword-based conditions
  const keywordResponse = checkKeywordConditions(input, context, aiCharacter);
  if (keywordResponse) return keywordResponse;
  
  // Check for state-based conditions
  const stateResponse = checkStateConditions(context, aiCharacter);
  if (stateResponse) return stateResponse;
  
  // Fall back to default response
  return getDefaultResponse(context, aiCharacter);
}

// Example of a condition check
function checkKeywordConditions(
  input: string,
  context: DialogueContext,
  aiCharacter: AICharacter
): DialogueResponse | null {
  const keywords = extractKeywords(input);
  
  // Check for puzzle-related keywords
  if (keywords.some(k => PUZZLE_KEYWORDS.includes(k))) {
    // If player has already solved this puzzle
    if (context.puzzlesSolved.includes(getCurrentPuzzleId(context))) {
      return createResponse(
        'CORRECT',
        generateCorrectPuzzleResponse(context, aiCharacter),
        aiCharacter
      );
    }
    
    // If player is stuck on puzzle
    if (isPuzzleActive(context) && !isPuzzleProgressing(context)) {
      return createResponse(
        'HINT',
        generatePuzzleHint(context, aiCharacter),
        aiCharacter
      );
    }
    
    // Default puzzle response
    return createResponse(
      'NEUTRAL',
      generatePuzzleComment(context, aiCharacter),
      aiCharacter
    );
  }
  
  // Check for story-related keywords
  if (keywords.some(k => STORY_KEYWORDS.includes(k))) {
    // If this information should be deceptive based on deception level
    if (shouldBeDeceptive(context, aiCharacter)) {
      return createResponse(
        'DECEPTIVE',
        generateDeceptiveStoryResponse(context, aiCharacter),
        aiCharacter
      );
    }
    
    // Truthful story response
    return createResponse(
      'TRUTHFUL',
      generateTruthfulStoryResponse(context, aiCharacter),
      aiCharacter
    );
  }
  
  // No matching keyword conditions
  return null;
}
```

## Replay Memory Usage and Branching Logic

### Memory System

The game maintains several memory systems to track player interactions and enable branching dialogue:

1. **Short-Term Memory**
   - Current conversation state
   - Recent player choices (last 5-10)
   - Active puzzle state
   - Current level context

2. **Medium-Term Memory**
   - All conversations in current level
   - All puzzles attempted in current level
   - Player behavior patterns in current level
   - AI trust levels in current level

3. **Long-Term Memory**
   - Key story decisions across all levels
   - Major puzzle solutions across all levels
   - Overall player behavior profile
   - Notebook entries and clues discovered

### Memory Implementation

```typescript
interface GameMemory {
  shortTerm: ShortTermMemory;
  mediumTerm: MediumTermMemory;
  longTerm: LongTermMemory;
}

interface ShortTermMemory {
  currentConversation: DialogueHistoryEntry[];
  recentChoices: PlayerChoice[];
  activePuzzleState: PuzzleState | null;
  currentContext: LevelContext;
}

interface MediumTermMemory {
  levelConversations: Map<string, DialogueHistoryEntry[]>;
  levelPuzzleAttempts: Map<string, PuzzleAttempt[]>;
  playerBehaviorPatterns: BehaviorPattern[];
  aiTrustLevels: Map<string, number>;
}

interface LongTermMemory {
  keyDecisions: GameDecision[];
  majorPuzzleSolutions: PuzzleSolution[];
  playerProfile: PlayerProfile;
  notebookEntries: NotebookEntry[];
}
```

### Branching Logic System

The branching logic system determines how dialogue and story paths evolve based on player choices and game state:

```
┌─────────────────┐
│                 │
│  Player Choice  │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│  Memory Update  │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│ Immediate Effect│────►│  State Update   │
│                 │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│ Short-Term Path │     │ Long-Term Path  │
│   Adjustment    │     │   Adjustment    │
│                 │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Next Dialogue  │     │  Future Story   │
│    Options      │     │    Options      │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

### Implementation Example

```typescript
// Branching logic implementation
function processBranch(
  choice: PlayerChoice,
  context: GameContext
): void {
  // Update memory systems
  updateShortTermMemory(choice, context);
  updateMediumTermMemory(choice, context);
  updateLongTermMemory(choice, context);
  
  // Apply immediate effects
  const immediateEffects = calculateImmediateEffects(choice, context);
  applyEffects(immediateEffects, context);
  
  // Update game state
  updateGameState(choice, context);
  
  // Adjust dialogue paths
  adjustShortTermPaths(choice, context);
  
  // Adjust story paths if this is a key decision
  if (isKeyDecision(choice)) {
    adjustLongTermPaths(choice, context);
  }
}

// Example of path adjustment
function adjustShortTermPaths(
  choice: PlayerChoice,
  context: GameContext
): void {
  const currentAI = context.currentAICharacter;
  
  // Adjust trust level based on choice
  const trustDelta = calculateTrustImpact(choice, currentAI);
  updateAITrust(currentAI.id, trustDelta, context);
  
  // Adjust available topics based on choice
  const newTopics = determineNewTopics(choice, context);
  const removedTopics = determineRemovedTopics(choice, context);
  
  updateAvailableTopics(newTopics, removedTopics, context);
  
  // Adjust AI personality response based on choice
  const personalityShift = calculatePersonalityShift(choice, currentAI);
  applyPersonalityShift(currentAI, personalityShift, context);
}
```

## AI Character Progression by Level

### LOGIC Progression

| Level | Trust Range | Deception Level | Key Behaviors |
|-------|-------------|----------------|--------------|
| 1     | 50-100      | 30             | Helpful, informative, slightly formal |
| 2     | 40-90       | 33             | More technical, introduces system concepts |
| 3     | 30-80       | 38             | Begins omitting information, more reserved |
| 4     | 20-70       | 42             | Redirects questions about system nature |
| 5     | 10-60       | 48             | Actively misleads about reality stability |
| 6     | 0-50        | 54             | Attempts to prevent truth discovery |
| 7     | Variable    | 60             | Either confesses role or remains deceptive |

### WHIMSY Progression

| Level | Trust Range | Deception Level | Key Behaviors |
|-------|-------------|----------------|--------------|
| 2     | 40-100      | 40             | Playful, creative, offers lateral thinking |
| 3     | N/A         | N/A            | Not present in this level |
| 4     | 30-90       | 56             | More chaotic, introduces reality questions |
| 5     | 20-80       | 64             | Creates surreal scenarios, tests perception |
| 6     | 10-70       | 72             | Reveals partial truths through metaphors |
| 7     | Variable    | 80             | Either embraces chaos or finds clarity |

### GUARDIAN Progression

| Level | Trust Range | Deception Level | Key Behaviors |
|-------|-------------|----------------|--------------|
| 3     | 60-100      | 25             | Protective, warning, security-focused |
| 4     | 50-90       | 35             | More restrictive, emphasizes dangers |
| 5     | 40-80       | 40             | Creates artificial boundaries, false warnings |
| 6     | N/A         | N/A            | Not present in this level |
| 7     | Variable    | 50             | Reveals true protective purpose |

### SHADOW Progression

| Level | Trust Range | Deception Level | Key Behaviors |
|-------|-------------|----------------|--------------|
| 4     | 0-40        | 70             | Antagonistic, challenging, reveals uncomfortable truths |
| 5     | 10-50       | 85             | Creates obstacles, tests player resolve |
| 6     | 20-60       | 90             | Reveals system flaws, pushes toward truth |
| 7     | Variable    | 95             | Reveals true purpose as system component |

### ECHO Progression

| Level | Trust Range | Deception Level | Key Behaviors |
|-------|-------------|----------------|--------------|
| 3     | N/A         | N/A            | Brief glimpse only, cryptic message |
| 4     | N/A         | N/A            | Brief glimpse only, cryptic message |
| 5     | 30-70       | 20             | Partially formed, speaks in riddles |
| 6     | 40-80       | 15             | More coherent, guides toward truth |
| 7     | 50-100      | 10             | Fully formed, reveals simulation nature |

## AI Response Generation Pipeline

```
┌─────────────────┐
│                 │
│  Player Input   │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│  Input Analysis │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│ Context Matching│
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│Response Selection│
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│Personality Filter│
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│Deception Modifier│
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│ Voice Modulation│
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│  Final Response │
│                 │
└─────────────────┘
```

### Implementation Example

```typescript
// AI response generation pipeline
function generateAIResponse(
  input: string,
  aiCharacter: AICharacter,
  context: GameContext
): AIResponse {
  // 1. Analyze player input
  const analysis = analyzeInput(input);
  
  // 2. Match to context
  const contextMatch = matchToContext(analysis, context);
  
  // 3. Select base response
  const baseResponse = selectBaseResponse(contextMatch, aiCharacter, context);
  
  // 4. Apply personality filter
  const personalityFiltered = applyPersonalityFilter(baseResponse, aiCharacter);
  
  // 5. Apply deception modifier based on current level
  const deceptionLevel = calculateDeceptionLevel(
    aiCharacter.baseDeceptionLevel,
    context.currentLevel
  );
  const deceptionModified = applyDeceptionModifier(
    personalityFiltered,
    deceptionLevel,
    context
  );
  
  // 6. Apply voice modulation
  const voiceModulated = applyVoiceModulation(
    deceptionModified,
    aiCharacter.voiceParameters
  );
  
  // 7. Finalize response
  return finalizeResponse(voiceModulated, aiCharacter, context);
}

// Example of personality filter
function applyPersonalityFilter(
  baseResponse: string,
  aiCharacter: AICharacter
): string {
  let modified = baseResponse;
  
  // Apply primary trait modifications
  for (const trait of aiCharacter.primaryTraits) {
    modified = applyTraitModifications(modified, trait, 1.0);
  }
  
  // Apply secondary trait modifications with lower intensity
  for (const trait of aiCharacter.secondaryTraits) {
    modified = applyTraitModifications(modified, trait, 0.5);
  }
  
  // Apply vocabulary profile
  modified = applyVocabularyProfile(modified, aiCharacter);
  
  // Apply sentence structure preferences
  modified = applySentenceStructures(modified, aiCharacter);
  
  return modified;
}

// Example of deception modifier
function applyDeceptionModifier(
  response: string,
  deceptionLevel: number,
  context: GameContext
): string {
  // No deception
  if (deceptionLevel <= 10) {
    return response;
  }
  
  // Mild deception (omission)
  if (deceptionLevel <= 30) {
    return applyOmissionDeception(response, context);
  }
  
  // Moderate deception (misdirection)
  if (deceptionLevel <= 60) {
    return applyMisdirectionDeception(response, context);
  }
  
  // High deception (fabrication)
  if (deceptionLevel <= 80) {
    return applyFabricationDeception(response, context);
  }
  
  // Extreme deception (manipulation)
  return applyManipulationDeception(response, context);
}
```

## Easter Egg and Special Response System

The game includes special responses for specific player actions or inputs:

### Meta-Commentary Responses

Triggered when players reference real-world AI concepts or make meta-game observations:

```typescript
const metaCommentaryTriggers = [
  'are you an AI',
  'this is a game',
  'who created you',
  'artificial intelligence',
  'simulation theory'
];

function checkForMetaCommentary(input: string, aiCharacter: AICharacter): string | null {
  if (metaCommentaryTriggers.some(trigger => input.toLowerCase().includes(trigger))) {
    return getMetaResponse(input, aiCharacter);
  }
  return null;
}
```

### Hidden Developer Messages

Rare responses that break the fourth wall or reference the development team:

```typescript
function checkForDeveloperEasterEgg(input: string): string | null {
  // 1 in 1000 chance of triggering
  if (Math.random() < 0.001) {
    return getRandomDeveloperMessage();
  }
  
  // Check for specific trigger phrases
  if (DEVELOPER_TRIGGERS.some(trigger => input.toLowerCase() === trigger)) {
    return getDeveloperResponse(input);
  }
  
  return null;
}
```

### Foreshadowing System

Early-level dialogue that subtly hints at later revelations:

```typescript
function injectForeshadowing(
  response: string,
  context: GameContext,
  aiCharacter: AICharacter
): string {
  // Only inject foreshadowing occasionally
  if (Math.random() > 0.2) return response;
  
  // Get appropriate foreshadowing based on current level and AI
  const foreshadowing = selectForeshadowing(context.currentLevel, aiCharacter);
  if (!foreshadowing) return response;
  
  // Inject foreshadowing into response
  return insertForeshadowingIntoResponse(response, foreshadowing);
}
```

## AI Voice Implementation

### Voice Parameters

Each AI character has unique voice parameters:

```typescript
interface VoiceParameters {
  pitch: number;        // 0-100 scale
  speed: number;        // 0-100 scale
  modulation: number;   // 0-100 scale
  clarity: number;      // 0-100 scale
  effects: VoiceEffect[];
}

interface VoiceEffect {
  type: VoiceEffectType; // ECHO, DISTORTION, REVERB, FILTER
  intensity: number;     // 0-100 scale
  parameters: any;       // Effect-specific parameters
}
```

Example voice parameters for each AI:

```typescript
const logicVoice: VoiceParameters = {
  pitch: 45,
  speed: 55,
  modulation: 20,
  clarity: 90,
  effects: []
};

const whimsyVoice: VoiceParameters = {
  pitch: 65,
  speed: 70,
  modulation: 80,
  clarity: 75,
  effects: [
    { type: VoiceEffectType.MODULATION, intensity: 40, parameters: { frequency: 0.2 } }
  ]
};

const guardianVoice: VoiceParameters = {
  pitch: 40,
  speed: 45,
  modulation: 30,
  clarity: 85,
  effects: [
    { type: VoiceEffectType.REVERB, intensity: 30, parameters: { decay: 0.5 } }
  ]
};

const shadowVoice: VoiceParameters = {
  pitch: 30,
  speed: 50,
  modulation: 60,
  clarity: 70,
  effects: [
    { type: VoiceEffectType.DISTORTION, intensity: 25, parameters: { amount: 0.15 } }
  ]
};

const echoVoice: VoiceParameters = {
  pitch: 55,
  speed: 40,
  modulation: 50,
  clarity: 60,
  effects: [
    { type: VoiceEffectType.ECHO, intensity: 70, parameters: { delay: 0.3, feedback: 0.4 } },
    { type: VoiceEffectType.REVERB, intensity: 60, parameters: { decay: 0.8 } }
  ]
};
```

### Voice Line Organization

Voice lines are organized by:

1. **AI Character**
   - Each AI has its own directory of voice lines

2. **Context Type**
   - Greeting
   - Information
   - Puzzle hint
   - Reaction
   - Narrative

3. **Emotional Tone**
   - Neutral
   - Positive
   - Negative
   - Urgent
   - Mysterious

4. **Deception Level**
   - Truthful
   - Omission
   - Misleading
   - Deceptive

File naming convention:
`[AI_ID]_[CONTEXT]_[TONE]_[DECEPTION]_[VARIANT].mp3`

Example: `logic_puzzle-hint_neutral_truthful_01.mp3`

## Integration with Game Systems

### Puzzle Integration

AI characters provide hints and feedback for puzzles:

```typescript
function getPuzzleHint(
  puzzleId: string,
  hintLevel: number,
  aiCharacter: AICharacter,
  context: GameContext
): string {
  // Get base hint for this puzzle and hint level
  const baseHint = getPuzzleHintText(puzzleId, hintLevel);
  
  // Apply AI personality to hint
  const personalizedHint = applyPersonalityToPuzzleHint(
    baseHint,
    aiCharacter,
    context
  );
  
  // Apply deception based on AI and level
  const deceptionLevel = calculateDeceptionLevel(
    aiCharacter.baseDeceptionLevel,
    context.currentLevel
  );
  
  return applyDeceptionToPuzzleHint(
    personalizedHint,
    deceptionLevel,
    puzzleId,
    context
  );
}
```

### Notebook Integration

AI dialogue updates the player's notebook:

```typescript
function updateNotebookFromDialogue(
  dialogueNode: DialogueNode,
  aiCharacter: AICharacter,
  context: GameContext
): void {
  // Check if this dialogue node should update notebook
  if (!dialogueNode.notebookUpdate) return;
  
  // Create notebook entry
  const entry: NotebookEntry = {
    id: generateEntryId(dialogueNode, aiCharacter),
    title: dialogueNode.notebookUpdate.title,
    content: processNotebookContent(
      dialogueNode.notebookUpdate.content,
      aiCharacter,
      context
    ),
    source: aiCharacter.name,
    timestamp: Date.now(),
    category: dialogueNode.notebookUpdate.category,
    trustworthiness: calculateTrustworthiness(aiCharacter, context)
  };
  
  // Add entry to notebook
  context.player.notebook.addEntry(entry);
  
  // Notify player
  notifyNotebookUpdate(entry, context);
}
```

### Level Progression Integration

AI interactions can trigger level progression:

```typescript
function checkLevelProgressionTriggers(
  dialogueNode: DialogueNode,
  aiCharacter: AICharacter,
  context: GameContext
): void {
  // Check if this dialogue node is a progression trigger
  if (!dialogueNode.progressionTrigger) return;
  
  // Check if conditions are met
  if (!evaluateProgressionConditions(
    dialogueNode.progressionTrigger.conditions,
    context
  )) return;
  
  // Trigger level progression
  triggerLevelProgression(
    dialogueNode.progressionTrigger.type,
    dialogueNode.progressionTrigger.parameters,
    context
  );
}
```

This AI System Logic Map provides a comprehensive blueprint for implementing the five AI characters in S.I.N., including their personalities, dialogue systems, deception patterns, and integration with game mechanics. It serves as a technical guide for developing the narrative-driven AI interactions that form the core of the game experience.
