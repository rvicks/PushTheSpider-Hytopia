# S.I.N. - Sentient Intelligence Nexus

## Overview

This is a refactored version of the game for fixing websocket connection issues. The codebase has been cleaned up and improved to ensure reliable connections to hytopia.com/play/.

## Quick Start

1. **Install dependencies**:
   ```
   bun install
   ```

2. **Run the server**:
   ```
   bun start
   ```

3. **Connect to the game**:
   - First, visit https://localhost:8080 in your browser
   - Accept the security warning for the self-signed certificate
   - Then go to https://hytopia.com/play/ and enter `localhost:8080` as the server

## Connection Process Explained

When connecting to hytopia.com/play/, the following process occurs:

1. The browser attempts to establish a WebSocket connection (WSS) to your local server
2. The server authenticates the connection and creates a player instance
3. Game assets and UI are loaded
4. Player entity is spawned in the game world

## Common Issues and Solutions

### 1. WebSocket Connection Failed

**Symptoms:** 
- "WebSocket connection to 'wss://localhost:8080/?join=localhost:8080' failed"
- Cannot join the game

**Solutions:**
- Ensure you've visited https://localhost:8080 directly first and accepted the certificate
- Check that your firewall isn't blocking port 8080
- Make sure no other application is using port 8080
- Try running in a different browser (Chrome works best)

### 2. Game Loads But Player Doesn't Appear

**Symptoms:** 
- Connected to the game but can't see your character
- Can't move around

**Solutions:**
- Press V to cycle through camera modes
- Press Escape to ensure the game window has focus
- Check the server logs for any errors related to player spawning

### 3. UI Not Loading

**Symptoms:**
- No crosshair or other UI elements
- Can't see interaction prompts

**Solutions:**
- Check the browser console for errors
- Ensure the ui/index.html file exists and is correctly formatted
- Try clearing your browser cache

## Debugging

- Server logs provide detailed information about connection attempts and player activity
- Browser console logs show UI-related issues
- Use the `/debug` command in game chat to toggle additional debug information

## Architecture

This game uses:
- Hytopia SDK (v0.3.27) for game engine functionality
- Bun as the JavaScript/TypeScript runtime
- WebSockets for real-time communication between client and server

## Technical Improvements in This Refactor

1. **Improved Error Handling** - Better error catching and recovery
2. **Clean Startup Process** - Better server initialization sequence
3. **More Robust Player Connections** - Improved handling of join/leave events
4. **Cleaner UI Code** - Restructured UI for better reliability
5. **Updated Documentation** - Clear connection instructions

## Next Steps

- Implement full notebook functionality
- Add more interactive elements
- Expand the game world
