# Push-the-Spider Game - Comprehensive Fix Instructions

This document provides complete instructions to fix all the issues with the Push-the-Spider game.

## Issues Fixed

This set of fixes addresses the following issues:

1. **Texture Loading**: Block textures were failing to load due to corrupted texture paths (base64 data in URLs)
2. **Multi-Texture Blocks**: Special blocks like grass, logs, etc. were missing their side textures
3. **Camera Mode**: Initial view was in camera mode instead of player avatar view
4. **Chunk Boundary Error**: Runtime error in the debug code related to chunk coordinates

## Step 1: Run the Unified Fix Script

The `unified-fix.js` script combines all the fixes into one solution:

```bash
bun run unified-fix.js
```

This script:
- Fixes all texture paths in map.json
- Ensures multi-texture blocks have proper side textures
- Copies existing textures from assets to public directory
- Creates HTML placeholders for any missing textures

## Step 2: Restart the Server

After running the fix script, restart the server:

```bash
bun run start
```

## Step 3: Connect to the Game

Connect to your local game server at:

```
https://hytopia.com/play?join=localhost:8080
```

## Step 4: Switch to First-Person View

The most important step! To switch from camera mode to player avatar view:

1. **Press ESC** to focus the game window
2. **Press the V key** (not F5) to cycle through camera modes
3. **Keep pressing V** until you see your avatar and can move with WASD

## Troubleshooting

### Missing Blocks

If some blocks are still missing:

1. Check the server console to see if there are any texture loading errors
2. Verify that all texture paths in map.json are correct (blocks/blockname.png format)
3. Make sure the public/blocks directory contains all required textures

### Camera Mode Issues

If you can't switch to player view:

1. Make sure you've pressed ESC to focus the game window first
2. Try pressing V multiple times - there are multiple camera modes to cycle through
3. Click in the game window to ensure it has keyboard focus
4. Try refresh the page and reconnect

### Server Connection Issues

If you can't connect to the server:

1. Make sure the server is running (bun run start)
2. Try accessing https://localhost:8080 directly - you should see {"status":"OK","version":"0.3.15"}
3. Disable browser extensions that might be blocking the connection
4. Try a different browser

## Technical Details

### Player Spawn Settings

Player spawns at coordinates (18, 9, 27) as requested.

### Texture Paths

All texture paths follow the convention:
- Single-texture blocks: `blocks/blockname.png`
- Multi-texture blocks: `blocks/blockname` with side textures at `blocks/blockname/+x.png`, etc.

### Camera Controls

Hytopia camera controls:
- V key: Cycle through camera modes
- WASD: Move player
- Space: Jump
- Shift: Sprint 