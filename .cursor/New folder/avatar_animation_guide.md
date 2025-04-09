# Avatar Animation Implementation Guide for Hytopia

This guide addresses the issue with avatar walking animations in Hytopia, where the avatar slides instead of walking properly.

## Understanding the Problem

The sliding issue occurs when:
1. The avatar model doesn't have proper walking animations defined in the GLB/GLTF file
2. The animations aren't properly referenced in the code
3. The animation state changes aren't properly managed based on player input

## Solution Implementation

### 1. Ensure Proper Animation Names in Your GLTF/GLB File

Your avatar model must include properly named animations:
- `idle` - For standing still
- `walk` - For walking movement
- `run` - For running movement (optional)

You can verify animation names using a GLTF viewer like [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/).

### 2. Correct Animation Implementation in Code

```typescript
// In your player entity creation code
const playerEntity = new PlayerEntity({
  player,
  name: 'Player',
  modelUri: 'models/player.gltf', // Path to your player model
  modelLoopedAnimations: ['idle'], // Start with idle animation
  modelScale: 0.5, // Adjust scale as needed
});

// Implement proper animation state changes based on player input
// This should be in your character controller implementation
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
}
```

### 3. Debugging Animation Issues

If animations still don't work correctly:

1. Verify animation names in your GLTF file match exactly what you're using in code
2. Check the console for any errors related to animations
3. Try using the debug rendering to see if the entity is moving correctly:
   ```typescript
   world.simulation.enableDebugRendering(true);
   ```
4. Ensure your model's scale is appropriate for the game world

### 4. Common Pitfalls

- **Case sensitivity**: Animation names are case-sensitive. Ensure 'walk' in your code matches 'walk' in your GLTF file (not 'Walk' or 'WALK').
- **Missing animations**: If your model doesn't have the required animations, you'll need to add them in a 3D modeling program.
- **Animation blending**: If multiple animations play at once, they will blend together, which might cause unexpected results.

## Testing Your Implementation

1. Implement the code changes above
2. Run your game and test movement with WASD keys
3. Observe if the avatar now walks properly instead of sliding
4. Test different movement states (idle, walking, running)

This implementation follows Hytopia's official animation system and should resolve the sliding issue when properly implemented.
