# Crosshair Implementation Guide for Hytopia

This guide addresses the issue with implementing a crosshair in Hytopia games, ensuring it displays properly during game test sessions.

## Understanding Crosshair Implementation

In Hytopia, crosshairs are implemented using the Overlay UI system, which allows you to create HTML/CSS elements that overlay your game scene.

## Step-by-Step Implementation

### 1. Create the UI Directory Structure

First, ensure you have the proper directory structure:

```
assets/
└── ui/
    └── index.html
```

### 2. Create the Crosshair HTML/CSS

Create or modify your `assets/ui/index.html` file with the following code:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Crosshair container - centered in viewport */
    .crosshair-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; /* Allows clicks to pass through */
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
    
    /* Optional: Add a center dot */
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
  <!-- Crosshair element -->
  <div class="crosshair-container">
    <div class="crosshair">
      <div class="crosshair-dot"></div>
    </div>
  </div>
</body>
</html>
```

### 3. Load the UI in Your Game Code

Add the following code to your game's initialization:

```typescript
// In your game's main file (e.g., index.ts)
import { startServer, PlayerEvent } from 'hytopia';

startServer(world => {
  // Other initialization code...
  
  // Set up UI loading for players when they join
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    // Load the UI for the player
    player.ui.load('ui/index.html');
    
    // Other player initialization...
  });
});
```

### 4. Advanced Customization Options

#### Changing Crosshair Appearance

You can modify the CSS to create different crosshair styles:

```css
/* Circle crosshair */
.crosshair-circle {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

/* Dynamic crosshair that changes with player state */
.crosshair.targeting {
  /* Red crosshair for targeting mode */
  --crosshair-color: rgba(255, 0, 0, 0.8);
}
```

#### Interactive Crosshair

For a crosshair that changes based on game state:

```typescript
// In your game code
player.on('targetAcquired', () => {
  // Send a message to the UI to change crosshair state
  player.ui.postMessage({
    type: 'crosshairState',
    state: 'targeting'
  });
});

// In your UI HTML, add this script
<script>
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'crosshairState') {
      const crosshair = document.querySelector('.crosshair');
      
      // Remove all state classes
      crosshair.classList.remove('targeting', 'inactive');
      
      // Add the new state class
      if (data.state) {
        crosshair.classList.add(data.state);
      }
    }
  });
</script>
```

### 5. Troubleshooting Common Issues

#### Crosshair Not Showing

1. Verify your UI path is correct: `player.ui.load('ui/index.html')` should point to `assets/ui/index.html`
2. Check browser console for any errors
3. Ensure the z-index is high enough (1000+) to appear above other UI elements
4. Verify the CSS is properly centered with fixed positioning

#### Crosshair Appears Offset

If the crosshair isn't centered:

```css
.crosshair-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Add these to debug positioning */
  width: 1px;
  height: 1px;
  background-color: red; /* Temporary to see exact center */
}
```

#### Crosshair Blocks Interaction

Ensure pointer-events is set to none:

```css
.crosshair-container {
  pointer-events: none; /* Critical for allowing clicks to pass through */
}
```

## Testing Your Implementation

1. Implement the code changes above
2. Run your game and join as a player
3. Verify the crosshair appears centered on the screen
4. Test that you can interact with the game world through the crosshair

This implementation follows Hytopia's official Overlay UI system and should resolve the crosshair display issues in your game test sessions.
