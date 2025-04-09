# Push-the-Spider Game Fixes

This document provides instructions for fixing the two main issues in the game:

1. Runtime error related to chunk coordinates
2. Missing texture errors (404s with base64-like paths)

## Issue 1: Chunk Boundary Error

The error occurs when the debug code tries to get a chunk with coordinates that are not divisible by 16 (the chunk size in Hytopia). The player spawn coordinates at (18, 9, 27) are valid, but the debug check needs to use chunk-aligned coordinates.

**Fixed by:**
- Updating the debug code in `index.ts` to calculate chunk-aligned coordinates from the spawn position
- This allows the player to spawn at (18, 9, 27) as requested while avoiding the runtime error

## Issue 2: Texture Loading Errors

The texture paths in the map.json file appear to be corrupted, with many of them containing base64-like data instead of proper file paths. This causes 404 errors when the client tries to load these textures.

**Fixed by:**
- Creating a script `fix-textures.js` that:
  1. Copies all existing textures from `assets/blocks` to `public/blocks`
  2. Fixes texture paths in `map.json` to use proper paths like `blocks/blockname.png`
  3. Creates HTML placeholder files for any missing textures

## How to Apply the Fixes

1. **Fix the chunk boundary error:**
   - The `index.ts` file has been updated to use chunk-aligned coordinates for debug checks
   - No action needed as this change is already applied

2. **Fix texture loading:**
   - Run the texture fix script:
     ```bash
     bun run fix-textures.js
     ```
   - This will:
     - Copy textures from assets to public
     - Fix paths in map.json
     - Create placeholders for missing textures
     - Save the fixed map to assets/maps/fixed-map.json and copy it to public/maps/map.json

3. **Restart the server:**
   ```bash
   bun run start
   ```

4. **Connect to the game:**
   - Connect to the game at http://localhost:8080
   - Or use the Hytopia client URL: https://hytopia.com/play/?1
   - The game should now load with proper textures and without runtime errors

## Camera Controls

- Press F5 to switch to first-person view
- ESC to focus the game window
- WASD to move, SPACE to jump, SHIFT to sprint
- Click in the game window to ensure keyboard focus

## Additional Notes

- If textures are still missing, you may need to clear your browser cache
- The HTML placeholders provide colored boxes for any textures that are missing
- Check the console logs for any remaining errors after applying the fixes 